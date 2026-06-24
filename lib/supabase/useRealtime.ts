"use client";

/**
 * Loop C — Supabase Realtime hooks.
 *
 * `useRealtimeQuery` runs an initial fetch through the typed query layer, then
 * subscribes to `postgres_changes` on the given table and re-runs the fetch
 * whenever a relevant row changes. This keeps every viewport (admin approvals,
 * supplier pipeline, buyer deals, driver milestones) synchronized live without
 * a manual refresh. Degrades to a one-shot fetch when Supabase is unconfigured.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient, SUPABASE_CONFIGURED } from "./client";
import type { DB, Result } from "./queries";

type TableName =
  | "profiles"
  | "products"
  | "warehouses"
  | "rfqs"
  | "quotations"
  | "deals";

export interface LiveState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  /** Manual refetch (e.g. after a mutation, for instant local feedback). */
  refresh: () => void;
}

export function useRealtimeQuery<T>(
  table: TableName,
  fetcher: (db: DB) => Promise<Result<T>>,
  fallback: T,
  deps: ReadonlyArray<unknown> = []
): LiveState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const clientRef = useRef<DB | null>(null);
  if (SUPABASE_CONFIGURED && !clientRef.current) {
    clientRef.current = createClient();
  }

  const load = useCallback(async () => {
    const db = clientRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetcherRef.current(db);
    if (res.error) {
      setError(res.error);
    } else {
      setError(null);
      setData(res.data ?? fallback);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }
    const db = clientRef.current!;
    let channel: RealtimeChannel | null = null;
    let active = true;

    void load();

    channel = db
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          if (active) void load();
        }
      )
      .subscribe();

    return () => {
      active = false;
      if (channel) void db.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, load, ...deps]);

  return { data, loading, error, refresh: load };
}

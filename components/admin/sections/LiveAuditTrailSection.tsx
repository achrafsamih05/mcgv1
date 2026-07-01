"use client";

/**
 * Admin — LIVE Audit Trail (system_logs).
 *
 * Descending scrolling feed of `public.system_logs` showing the actor name,
 * the triggered action, a neat JSON view of `details`, and precise timestamps.
 * Realtime-subscribed: new log rows prepend instantly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ScrollText } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchSystemLogs } from "@/lib/supabase/queries";
import type { Json, SystemLog } from "@/lib/supabase/database.types";
import { Panel, PanelHeader } from "../ui/primitives";

function formatDetails(details: Json | null): string {
  if (details === null || details === undefined) return "";
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

export function LiveAuditTrailSection() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchSystemLogs(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      setLogs(res.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    void load();
    const channel = db
      .channel("admin:system_logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "system_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as SystemLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Audit Trail" description="Immutable activity log" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to load the live audit trail.</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="Audit Trail" description={`${logs.length} recent ${logs.length === 1 ? "entry" : "entries"} · newest first`} />
      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}
      {loading && logs.length === 0 ? (
        <div className="space-y-3 p-5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-navy-50" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
          <ScrollText className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-medium">No audit entries recorded yet.</p>
        </div>
      ) : (
        <ol className="max-h-[560px] divide-y divide-navy-100 overflow-y-auto">
          {logs.map((log) => {
            const details = formatDetails(log.details);
            return (
              <li key={log.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/15 text-accent-600">
                      <ScrollText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {log.action}
                  </span>
                  <span className="text-xs text-navy-500">
                    {log.actor_name ?? "System"} · {new Date(log.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}
                  </span>
                </div>
                {details && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-navy-950 px-3 py-2 text-[11px] leading-relaxed text-accent-300">
                    {details}
                  </pre>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

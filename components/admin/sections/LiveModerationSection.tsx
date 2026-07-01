"use client";

/**
 * Admin — LIVE Message & Chat Moderation.
 *
 * Feed from `public.moderation_flags` joined to sender + reporter profiles.
 * Admin can Dismiss a flag (mark resolved) or Suspend the sender (sets their
 * profile status to REJECTED). Realtime-subscribed with skeleton loading.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Ban, Loader2, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchModerationFlags, resolveModerationFlag, suspendUser } from "@/lib/supabase/queries";
import type { ModerationFlagWithParties } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

function partyName(p: { full_name: string | null; company_name: string | null } | null): string {
  return p?.company_name || p?.full_name || "Unknown";
}

export function LiveModerationSection() {
  const [flags, setFlags] = useState<ModerationFlagWithParties[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchModerationFlags(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      setFlags(res.data ?? []);
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
      .channel("admin:moderation")
      .on("postgres_changes", { event: "*", schema: "public", table: "moderation_flags" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const dismiss = async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    setBusyId(id);
    await resolveModerationFlag(db, id);
    setBusyId(null);
  };

  const squelch = async (flagId: string, senderId: string | null) => {
    const db = dbRef.current;
    if (!db || !senderId) return;
    setBusyId(flagId);
    await suspendUser(db, senderId);
    await resolveModerationFlag(db, flagId);
    setBusyId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Message Moderation" description="Flagged chat queue" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to load the moderation queue.</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="Message Moderation" description={`${flags.length} flagged ${flags.length === 1 ? "message" : "messages"}`} />
      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}
      {loading && flags.length === 0 ? (
        <div className="space-y-3 p-5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-navy-50" />
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
          <MessageSquareWarning className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-medium">No flagged messages. The community is behaving.</p>
        </div>
      ) : (
        <ul className="divide-y divide-navy-100">
          {flags.map((f) => (
            <li key={f.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy-900">{partyName(f.sender)}</span>
                  <Badge tone="danger">{f.flag_reason}</Badge>
                  {f.is_resolved && <Badge tone="success">Resolved</Badge>}
                </div>
                <p className="mt-1 text-xs text-navy-500">
                  Reported by {partyName(f.reporter)} · {new Date(f.created_at).toLocaleString()}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-navy-400">msg: {f.chat_message_id}</p>
              </div>
              {!f.is_resolved && (
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" disabled={busyId === f.id} onClick={() => dismiss(f.id)}>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />Dismiss Flag
                  </Button>
                  <Button variant="danger" size="sm" disabled={busyId === f.id || !f.sender_id} onClick={() => squelch(f.id, f.sender_id)}>
                    {busyId === f.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Ban className="h-4 w-4" aria-hidden="true" />}
                    Squelch User
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

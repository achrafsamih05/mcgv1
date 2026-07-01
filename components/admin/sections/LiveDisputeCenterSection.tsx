"use client";

/**
 * Admin — LIVE Dispute Center.
 *
 * Reads `public.disputes` joined to creator + target profiles, lets the CEO
 * write an `admin_verdict` and settle (RESOLVED / DISMISSED). Settling also
 * appends a `system_logs` entry (handled in settleDispute). Realtime-subscribed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Gavel, Loader2, X } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchDisputes, processDisputeSettlement } from "@/lib/supabase/queries";
import type { DisputeStatus, DisputeWithParties } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const statusTone: Record<DisputeStatus, Parameters<typeof Badge>[0]["tone"]> = {
  OPEN: "accent",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

function partyName(p: { full_name: string | null; company_name: string | null } | null): string {
  return p?.company_name || p?.full_name || "Unknown party";
}

export function LiveDisputeCenterSection() {
  const [disputes, setDisputes] = useState<DisputeWithParties[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verdict, setVerdict] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchDisputes(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      setDisputes(res.data ?? []);
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
      .channel("admin:disputes")
      .on("postgres_changes", { event: "*", schema: "public", table: "disputes" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const selected = disputes.find((d) => d.id === selectedId) ?? null;

  const openReview = (d: DisputeWithParties) => {
    setSelectedId(d.id);
    setVerdict(d.admin_verdict ?? "");
    setActionError(null);
  };

  const settle = async (status: Extract<DisputeStatus, "RESOLVED" | "DISMISSED">) => {
    const db = dbRef.current;
    if (!db || !selected || !verdict.trim()) return;
    setBusy(true);
    setActionError(null);
    // Invoke the ACID transaction engine: adjusts escrow/wallets, updates the
    // deal, and records the verdict atomically. Realtime refreshes the feed.
    const res = await processDisputeSettlement(db, selected.id, status, verdict.trim());
    setBusy(false);
    if (res.error) {
      setActionError(res.error);
      return;
    }
    setSelectedId(null);
    setVerdict("");
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Dispute Center" description="Tri-party mediation" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to load live disputes.</div>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <Panel>
        <PanelHeader title="Dispute Center" description={`${disputes.length} ${disputes.length === 1 ? "case" : "cases"} on record`} />
        {error && (
          <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}
        {loading && disputes.length === 0 ? (
          <SkeletonRows />
        ) : disputes.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-400">No disputes filed on the platform.</div>
        ) : (
          <ul className="divide-y divide-navy-100">
            {disputes.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => openReview(d)}
                  className={`flex w-full cursor-pointer flex-col gap-1 px-5 py-4 text-left transition-colors duration-150 ${selectedId === d.id ? "bg-accent-50" : "hover:bg-navy-50"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-navy-900">{d.subject}</span>
                    <Badge tone={statusTone[d.status]}>{d.status.replace("_", " ")}</Badge>
                  </div>
                  <span className="text-xs text-navy-500">
                    {partyName(d.creator)} vs {partyName(d.target)}
                    {d.amount != null ? ` · $${d.amount.toLocaleString()}` : ""} · {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Verdict panel */}
      <Panel className="h-fit">
        <PanelHeader title="Admin Verdict" />
        <div className="p-5">
          {!selected ? (
            <p className="py-8 text-center text-sm text-navy-400">Select a dispute to review and issue a verdict.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-navy-950 p-4">
                <p className="text-sm font-bold text-white">{selected.subject}</p>
                <p className="mt-1 text-xs text-navy-300">
                  {partyName(selected.creator)} vs {partyName(selected.target)}
                </p>
                {selected.description && <p className="mt-2 text-xs text-navy-200">{selected.description}</p>}
                <p className="mt-2 text-xs font-semibold text-accent-400">
                  Current: {selected.status.replace("_", " ")}
                </p>
              </div>

              <div>
                <label htmlFor="verdict" className="mb-1.5 block text-sm font-medium text-navy-800">
                  Verdict <span className="text-accent-500">*</span>
                </label>
                <textarea
                  id="verdict"
                  rows={4}
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                  placeholder="Describe the ruling and any wallet adjustments…"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
                />
              </div>

              {actionError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{actionError}</p>
              )}

              <div className="flex gap-2">
                <Button variant="success" disabled={busy || !verdict.trim()} onClick={() => settle("RESOLVED")}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  Resolve
                </Button>
                <Button variant="secondary" disabled={busy || !verdict.trim()} onClick={() => settle("DISMISSED")}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Dismiss
                </Button>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-navy-400">
                <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                Settling writes an entry to the audit trail automatically.
              </p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-navy-100" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="px-5 py-4">
          <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-navy-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-navy-50" />
        </li>
      ))}
    </ul>
  );
}

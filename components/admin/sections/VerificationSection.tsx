"use client";

/**
 * Loop A — Admin approval funnel (LIVE).
 *
 * Subscribes to the `profiles` table in realtime, lists PENDING commercial
 * accounts oldest-first, and runs live APPROVE / REJECT updates through the
 * typed query layer. Any approve/reject — from this or another admin viewport —
 * propagates instantly via the Supabase Realtime channel (no refresh needed).
 *
 * When Supabase is not configured (local/demo), it renders a clear notice
 * rather than mock rows, per the "no placeholder data" requirement.
 */
import { useState } from "react";
import { BadgeCheck, Building2, Check, Clock, Loader2, RefreshCw, Truck, Warehouse, X } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchPendingProfiles, setProfileStatus } from "@/lib/supabase/queries";
import { useRealtimeQuery } from "@/lib/supabase/useRealtime";
import type { PlatformRole, Profile } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const roleMeta: Record<PlatformRole, { label: string; icon: typeof Truck }> = {
  BUYER: { label: "Importer", icon: Building2 },
  SUPPLIER: { label: "Supplier", icon: BadgeCheck },
  DRIVER: { label: "Carrier / Driver", icon: Truck },
  WAREHOUSE_HOST: { label: "Warehouse Host", icon: Warehouse },
  SUPER_ADMIN: { label: "Administrator", icon: BadgeCheck },
};

export function VerificationSection() {
  const { data: pending, loading, error, refresh } = useRealtimeQuery<Profile[]>(
    "profiles",
    fetchPendingProfiles,
    []
  );

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const decide = async (
    profileId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (!SUPABASE_CONFIGURED) return;
    setBusyId(profileId);
    setActionError(null);
    const db = createClient();
    const res = await setProfileStatus(db, profileId, status);
    if (res.error) {
      setActionError(res.error);
    } else {
      // Optimistic: realtime will also reconcile, but refresh for instant UX.
      refresh();
    }
    setBusyId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Verification Funnel" description="Live approval queue" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase (set the environment variables) to load the live
          pending-accounts queue.
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title="Pending Account Verification"
        description={`${pending.length} commercial ${pending.length === 1 ? "account" : "accounts"} awaiting review`}
        action={
          <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {actionError && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {actionError}
        </p>
      )}
      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          Could not load pending accounts: {error}
        </p>
      )}

      {loading && pending.length === 0 ? (
        <div className="flex items-center justify-center gap-2 p-12 text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading live queue…
        </div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
          <Clock className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-medium">No pending accounts to review.</p>
        </div>
      ) : (
        <ul className="divide-y divide-navy-100">
          {pending.map((p) => {
            const meta = roleMeta[p.role];
            const Icon = meta.icon;
            const busy = busyId === p.id;
            return (
              <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900">
                      {p.company_name || p.full_name || "Unnamed account"}
                    </p>
                    <p className="text-xs text-navy-500">
                      {meta.label}
                      {p.phone_number ? ` · ${p.phone_number}` : ""} · submitted{" "}
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-1">
                      <Badge tone="warning">PENDING</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="success" size="sm" disabled={busy} onClick={() => decide(p.id, "APPROVED")}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" disabled={busy} onClick={() => decide(p.id, "REJECTED")}>
                    <X className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

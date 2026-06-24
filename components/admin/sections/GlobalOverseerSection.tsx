"use client";

/**
 * Super Admin — Global Deal & Shipment Overseer.
 *
 * Cross-tenant live view of every shipment and RFQ on the platform. The admin
 * can manually override any shipment's 8-stage supply-chain position with an
 * instant `.update()` (RLS grants admins full control via is_super_admin()).
 * Realtime channels on `shipments` and `rfqs` keep the console live.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin, RefreshCw } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchAllRfqs, fetchAllShipments, setShipmentStage } from "@/lib/supabase/queries";
import { SHIPMENT_STAGES, type Rfq, type Shipment } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const rfqTone: Record<Rfq["status"], Parameters<typeof Badge>[0]["tone"]> = {
  OPEN: "accent",
  QUOTED: "info",
  CLOSED: "neutral",
};

export function GlobalOverseerSection() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const refresh = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [ship, rfq] = await Promise.all([fetchAllShipments(db), fetchAllRfqs(db)]);
    if (ship.error) setError(ship.error);
    else {
      setError(null);
      setShipments(ship.data ?? []);
    }
    setRfqs(rfq.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    void refresh();

    const channel = db
      .channel("admin:overseer")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "rfqs" }, () => void refresh())
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [refresh]);

  const override = async (shipment: Shipment, stage: number) => {
    const db = dbRef.current;
    if (!db || stage < 1 || stage > 8 || stage === shipment.current_stage) return;
    setBusyId(shipment.id);
    await setShipmentStage(db, shipment.id, stage);
    setBusyId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Global Deal & Shipment Overseer" description="Cross-tenant operations" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase to oversee live platform operations.
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader
          title="Global Shipment Overseer"
          description={`${shipments.length} cross-tenant ${shipments.length === 1 ? "shipment" : "shipments"} — admin can override any stage`}
          action={
            <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </Button>
          }
        />
        {error && (
          <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}
        {loading && shipments.length === 0 ? (
          <div className="flex items-center justify-center gap-2 p-12 text-navy-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading operations…
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-400">No active shipments on the platform yet.</div>
        ) : (
          <div className="space-y-5 p-5">
            {shipments.map((s) => (
              <div key={s.id} className="rounded-xl border border-navy-800 bg-navy-950 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />
                    {s.origin ?? "Origin"} → {s.destination ?? "Destination"}
                  </div>
                  <span className="text-xs font-medium text-accent-400">
                    Stage {s.current_stage} / 8 · {SHIPMENT_STAGES[s.current_stage - 1] ?? "—"}
                  </span>
                </div>
                <ol className="flex items-center overflow-x-auto pb-2">
                  {SHIPMENT_STAGES.map((label, i) => {
                    const stage = i + 1;
                    const done = stage < s.current_stage;
                    const activeStage = stage === s.current_stage;
                    const lit = done || activeStage;
                    return (
                      <li key={label} className="flex flex-1 items-center last:flex-none">
                        <button
                          type="button"
                          onClick={() => override(s, stage)}
                          disabled={busyId === s.id}
                          title={`Override to: ${label}`}
                          className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                              lit ? "bg-accent-500 text-white" : "bg-navy-700/50 text-navy-300"
                            }`}
                            aria-current={activeStage ? "step" : undefined}
                          >
                            {done ? <Check className="h-4 w-4" aria-hidden="true" /> : stage}
                          </span>
                          <span className={`max-w-[72px] text-center text-[10px] font-medium leading-tight ${lit ? "text-accent-400" : "text-navy-400"}`}>
                            {label}
                          </span>
                        </button>
                        {i < SHIPMENT_STAGES.length - 1 && (
                          <span className={`mx-1 h-0.5 flex-1 transition-colors duration-200 ${stage < s.current_stage ? "bg-accent-500" : "bg-navy-700/50"}`} />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Live RFQ Stream" description={`${rfqs.length} sourcing ${rfqs.length === 1 ? "request" : "requests"} across all tenants`} />
        {rfqs.length === 0 ? (
          <div className="p-10 text-center text-sm text-navy-400">No RFQs on the platform yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Quantity</th>
                  <th className="px-5 py-3 font-semibold">Budget</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {rfqs.slice(0, 12).map((r) => (
                  <tr key={r.id} className="hover:bg-navy-50/60">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-navy-900">{r.product_title}</div>
                      <div className="text-xs text-navy-500">{new Date(r.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-3 text-navy-700">{r.category ?? "—"}</td>
                    <td className="px-5 py-3 text-navy-700">{(r.quantity ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 font-medium text-navy-900">{r.target_budget ?? "—"}</td>
                    <td className="px-5 py-3"><Badge tone={rfqTone[r.status]}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

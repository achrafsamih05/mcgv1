"use client";

/**
 * Logistics — LIVE active shipment tracker with the 8-stage stepper.
 *
 * Fetches shipments assigned to the signed-in carrier, renders the orange
 * (#F97316) interactive 8-step supply-chain stepper, and updates
 * `current_stage` (1..8) with an instant `.update()` query. A realtime channel
 * keeps the view in sync when an admin/importer edits the shipment.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin, RefreshCw } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchCarrierShipments, setShipmentStage } from "@/lib/supabase/queries";
import { SHIPMENT_STAGES, type Shipment } from "@/lib/supabase/database.types";
import { Button, Panel, PanelHeader } from "../ui";

export function LiveTripsSection({ carrierId }: { carrierId: string | null }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const refresh = useCallback(async () => {
    const db = dbRef.current;
    if (!db || !carrierId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchCarrierShipments(db, carrierId);
    if (res.error) setFeedError(res.error);
    else {
      setFeedError(null);
      setShipments(res.data ?? []);
    }
    setLoading(false);
  }, [carrierId]);

  useEffect(() => {
    const db = dbRef.current;
    if (!db || !carrierId) {
      setLoading(false);
      return;
    }
    void refresh();

    const channel = db
      .channel(`logistics:shipments:${carrierId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipments", filter: `carrier_id=eq.${carrierId}` },
        () => void refresh()
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [carrierId, refresh]);

  const updateStage = async (shipment: Shipment, stage: number) => {
    const db = dbRef.current;
    if (!db || stage < 1 || stage > 8 || stage === shipment.current_stage) return;
    setBusyId(shipment.id);
    await setShipmentStage(db, shipment.id, stage);
    setBusyId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Active Shipments" description="Live supply-chain tracking" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase to track your live shipments.
        </div>
      </Panel>
    );
  }

  if (!carrierId) {
    return (
      <Panel>
        <PanelHeader title="Active Shipments" description="Live supply-chain tracking" />
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-navy-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Resolving your session…
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title="Active Shipments"
        description={`${shipments.length} assigned ${shipments.length === 1 ? "shipment" : "shipments"} — tap a stage to advance`}
        action={
          <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {feedError && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{feedError}</p>
      )}

      {loading && shipments.length === 0 ? (
        <div className="flex items-center justify-center gap-2 p-12 text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading shipments…
        </div>
      ) : shipments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
          <MapPin className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-medium">No shipments assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-5 p-5">
          {shipments.map((s) => (
            <div key={s.id} className="rounded-xl border border-navy-100 bg-navy-950 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />
                  {s.origin ?? "Origin"} → {s.destination ?? "Destination"}
                </div>
                <span className="text-xs font-medium text-accent-400">
                  Stage {s.current_stage} / 8 · {SHIPMENT_STAGES[s.current_stage - 1] ?? "—"}
                </span>
              </div>

              <Stepper
                current={s.current_stage}
                busy={busyId === s.id}
                onSelect={(stage) => updateStage(s, stage)}
              />

              {s.status_notes && (
                <p className="mt-3 rounded-lg bg-navy-900 px-3 py-2 text-xs text-navy-200">{s.status_notes}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={busyId === s.id || s.current_stage >= 8}
                  onClick={() => updateStage(s, Math.min(8, s.current_stage + 1))}
                >
                  {busyId === s.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  Advance Stage
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Stepper({
  current,
  busy,
  onSelect,
}: {
  current: number;
  busy: boolean;
  onSelect: (stage: number) => void;
}) {
  return (
    <ol className="flex items-center overflow-x-auto pb-2">
      {SHIPMENT_STAGES.map((label, i) => {
        const stage = i + 1;
        const done = stage < current;
        const activeStage = stage === current;
        const lit = done || activeStage;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onSelect(stage)}
              disabled={busy}
              title={`Set stage: ${label}`}
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
              <span className={`mx-1 h-0.5 flex-1 transition-colors duration-200 ${stage < current ? "bg-accent-500" : "bg-navy-700/50"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

"use client";

import { useState } from "react";
import { Check, Plus, Radio, Weight } from "lucide-react";
import {
  TRIP_STAGES,
  type ActiveTrip,
  type TripStage,
  type TripStatusUpdate,
} from "@/lib/logistics/types";
import { can, scopeToTenant, type ProviderSession } from "@/lib/logistics/rbac";
import { Badge, Button, Panel, PanelHeader } from "../ui";

// Preset quick-action status submissions per the spec.
const PRESET_UPDATES = [
  "Arrived at Shanghai Port Warehouse",
  "Cargo securely loaded onto truck bed",
  "En route to destination",
  "Arrived at Casablanca Hub",
  "Cargo signed and delivered",
];

export function TripsSection({
  session,
  seedTrips,
}: {
  session: ProviderSession;
  seedTrips: ActiveTrip[];
}) {
  const [trips, setTrips] = useState<ActiveTrip[]>(() => scopeToTenant(session, seedTrips));
  const [activeId, setActiveId] = useState<string>(trips[0]?.id ?? "");
  const [customLog, setCustomLog] = useState("");

  const canUpdate = can(session, "trip:update");
  const active = trips.find((t) => t.id === activeId);

  const advanceTo = (stage: TripStage) => {
    if (!active || !canUpdate) return;
    const update: TripStatusUpdate = {
      id: `u${Date.now()}`,
      tripId: active.id,
      message: `Status updated to "${stage}"`,
      stage,
      at: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
    };
    setTrips((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, stage, updates: [...t.updates, update] } : t))
    );
  };

  const appendLog = (message: string) => {
    if (!active || !canUpdate || !message.trim()) return;
    const update: TripStatusUpdate = {
      id: `u${Date.now()}`,
      tripId: active.id,
      message: message.trim(),
      stage: active.stage,
      at: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
    };
    setTrips((prev) => prev.map((t) => (t.id === active.id ? { ...t, updates: [...t.updates, update] } : t)));
    setCustomLog("");
  };

  const stageIndex = active ? TRIP_STAGES.indexOf(active.stage) : 0;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
      {/* Trip list */}
      <Panel className="h-fit">
        <div className="border-b border-navy-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-navy-900">Active Trips</h2>
          <p className="text-xs text-navy-500">{trips.length} in progress</p>
        </div>
        <ul className="divide-y divide-navy-100">
          {trips.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-colors duration-150 ${
                  activeId === t.id ? "bg-accent-50" : "hover:bg-navy-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-navy-900">{t.id}</span>
                  <Badge tone={t.stage === "Delivered Successfully" ? "success" : "info"}>{t.stage}</Badge>
                </span>
                <span className="text-xs text-navy-500">{t.clientName} · {t.origin} → {t.destination}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Trip detail */}
      {active ? (
        <div className="space-y-5">
          <Panel>
            <PanelHeader title={`Trip ${active.id}`} description={`${active.clientName} · ordered ${active.orderDate}`} />
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              <Meta label="Origin" value={active.origin} />
              <Meta label="Destination" value={active.destination} />
              <Meta label="Goods" value={active.goods} />
              <Meta label="Weight" value={`${active.weightKg.toLocaleString()} kg`} icon={<Weight className="h-3.5 w-3.5" />} />
            </div>
          </Panel>

          {/* Stepper */}
          <Panel>
            <PanelHeader title="Trip Lifecycle" description="Tap a stage to update the live status" />
            <div className="p-6">
              <ol className="space-y-0">
                {TRIP_STAGES.map((stage, i) => {
                  const done = i <= stageIndex;
                  const current = i === stageIndex;
                  return (
                    <li key={stage} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => advanceTo(stage)}
                          disabled={!canUpdate}
                          aria-label={`Set stage to ${stage}`}
                          aria-current={current ? "step" : undefined}
                          className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-200 disabled:cursor-not-allowed ${
                            done ? "border-accent-500 bg-accent-500 text-white" : "border-navy-200 bg-white text-navy-400 hover:border-accent-300"
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                        </button>
                        {i < TRIP_STAGES.length - 1 && (
                          <span className={`my-0.5 h-8 w-0.5 ${i < stageIndex ? "bg-accent-500" : "bg-navy-100"}`} aria-hidden="true" />
                        )}
                      </div>
                      <span className={`pt-1 text-sm font-medium ${current ? "text-accent-600" : done ? "text-navy-900" : "text-navy-400"}`}>
                        {stage}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Panel>

          {/* Update form + log */}
          <Panel>
            <PanelHeader title="Status Updates" description="Send a preset or custom log entry" />
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {PRESET_UPDATES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={!canUpdate}
                    onClick={() => appendLog(p)}
                    className="cursor-pointer rounded-full border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-600 transition-colors duration-200 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <label htmlFor="custom-log" className="sr-only">Custom status update</label>
                <input
                  id="custom-log"
                  value={customLog}
                  onChange={(e) => setCustomLog(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && appendLog(customLog)}
                  placeholder="Write a custom status update…"
                  className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm placeholder:text-navy-400 focus:border-accent-400"
                />
                <Button onClick={() => appendLog(customLog)} disabled={!canUpdate || !customLog.trim()}>
                  <Plus className="h-4 w-4" aria-hidden="true" />Log
                </Button>
              </div>

              <ul className="mt-5 space-y-3">
                {[...active.updates].reverse().map((u) => (
                  <li key={u.id} className="flex gap-3">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                      <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="flex-1 rounded-lg border border-navy-100 bg-navy-50/50 px-3 py-2">
                      <p className="text-sm font-medium text-navy-900">{u.message}</p>
                      <p className="text-xs text-navy-500">{u.at} · {u.stage}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      ) : (
        <Panel><div className="p-12 text-center text-navy-400">No active trips.</div></Panel>
      )}
    </div>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-navy-50 p-2.5">
      <p className="text-xs text-navy-500">{label}</p>
      <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">{icon}{value}</p>
    </div>
  );
}

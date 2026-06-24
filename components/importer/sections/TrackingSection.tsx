"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TRACKING_MILESTONES, type TrackingTimelineState } from "@/lib/importer/types";
import { scopeToUser, type ImporterSession } from "@/lib/importer/rbac";
import { Badge, Panel, PanelHeader } from "../ui";

export function TrackingSection({
  session,
  shipments,
}: {
  session: ImporterSession;
  shipments: TrackingTimelineState[];
}) {
  const scoped = scopeToUser(session, shipments);
  const [activeId, setActiveId] = useState<string>(scoped[0]?.id ?? "");
  const active = scoped.find((s) => s.id === activeId);

  const stageIndex = active ? TRACKING_MILESTONES.indexOf(active.currentMilestone) : 0;
  const pct = active ? Math.round(((stageIndex + 1) / TRACKING_MILESTONES.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
      <Panel className="h-fit">
        <div className="border-b border-navy-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-navy-900">Shipments</h2>
          <p className="text-xs text-navy-500">{scoped.length} active</p>
        </div>
        <ul className="divide-y divide-navy-100">
          {scoped.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActiveId(s.id)}
                className={`flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-colors duration-150 ${
                  activeId === s.id ? "bg-accent-50" : "hover:bg-navy-50"
                }`}
              >
                <span className="font-semibold text-navy-900">{s.shipmentRef}</span>
                <span className="truncate text-xs text-navy-500">{s.product}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {active ? (
        <Panel>
          <PanelHeader title={active.product} description={`${active.shipmentRef} · ${active.supplierName}`} />
          <div className="p-6">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-navy-700">{active.currentMilestone}</span>
                <span className="font-bold text-accent-600">{pct}% complete</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100">
                <div className="h-full rounded-full bg-accent-500 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Stepper */}
            <ol className="space-y-0">
              {TRACKING_MILESTONES.map((m, i) => {
                const done = i <= stageIndex;
                const current = i === stageIndex;
                const event = active.events.find((e) => e.milestone === m);
                return (
                  <li key={m} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        done ? "border-accent-500 bg-accent-500 text-white" : "border-navy-200 bg-white text-navy-400"
                      }`}>
                        {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                      </span>
                      {i < TRACKING_MILESTONES.length - 1 && (
                        <span className={`my-0.5 h-8 w-0.5 ${i < stageIndex ? "bg-accent-500" : "bg-navy-100"}`} aria-hidden="true" />
                      )}
                    </div>
                    <div className="pb-4 pt-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${current ? "text-accent-600" : done ? "text-navy-900" : "text-navy-400"}`}>{m}</span>
                        {current && <Badge tone="accent">Current</Badge>}
                      </div>
                      {event && (
                        <p className="mt-0.5 text-xs text-navy-500">{event.note} · {event.at}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Panel>
      ) : (
        <Panel><div className="p-12 text-center text-navy-400">No active shipments.</div></Panel>
      )}
    </div>
  );
}

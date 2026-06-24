"use client";

import { useState } from "react";
import { Check, Plus, Radio } from "lucide-react";
import type { OrderStage, TrackingLog } from "@/lib/admin/types";
import { orders, trackingLogs as seedLogs } from "@/lib/admin/data";
import { Button, Panel, PanelHeader } from "../ui/primitives";

const pipeline: OrderStage[] = [
  "Request Received",
  "Supplier Found",
  "Negotiation",
  "Production",
  "Shipping",
  "Arrived",
  "Delivered",
];

export function TrackingSection() {
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "");
  const [stageIndex, setStageIndex] = useState(
    Math.max(0, pipeline.indexOf(orders[0]?.stage ?? "Request Received"))
  );
  const [logs, setLogs] = useState<TrackingLog[]>(seedLogs);
  const [newLog, setNewLog] = useState("");

  const addLog = () => {
    if (!newLog.trim()) return;
    const now = new Date();
    setLogs((prev) => [
      {
        id: `L${prev.length + 1}`,
        message: newLog.trim(),
        author: "CEO Override",
        timestamp: now.toISOString().slice(0, 16).replace("T", " "),
      },
      ...prev,
    ]);
    setNewLog("");
  };

  return (
    <div className="space-y-5">
      <Panel>
        <PanelHeader
          title="CEO Status Override Console"
          description="Manually advance the global shipping timeline"
          action={
            <select
              aria-label="Select order to track"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                const o = orders.find((ord) => ord.id === e.target.value);
                setStageIndex(Math.max(0, pipeline.indexOf(o?.stage ?? "Request Received")));
              }}
              className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.id} — {o.product}</option>
              ))}
            </select>
          }
        />

        {/* Interactive progress bar */}
        <div className="p-6">
          <div className="relative">
            <div className="absolute left-0 right-0 top-4 h-1 rounded bg-navy-100" aria-hidden="true" />
            <div
              className="absolute left-0 top-4 h-1 rounded bg-accent-500 transition-all duration-500"
              style={{ width: `${(stageIndex / (pipeline.length - 1)) * 100}%` }}
              aria-hidden="true"
            />
            <ol className="relative flex justify-between">
              {pipeline.map((stage, i) => {
                const done = i <= stageIndex;
                return (
                  <li key={stage} className="flex flex-1 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setStageIndex(i)}
                      aria-label={`Set stage to ${stage}`}
                      aria-current={i === stageIndex ? "step" : undefined}
                      className={`relative z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-200 ${
                        done
                          ? "border-accent-500 bg-accent-500 text-white"
                          : "border-navy-200 bg-white text-navy-400 hover:border-accent-300"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                    </button>
                    <span className={`mt-2 max-w-[72px] text-center text-[11px] font-medium leading-tight ${done ? "text-navy-900" : "text-navy-400"}`}>
                      {stage}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </Panel>

      {/* Custom logs */}
      <Panel>
        <PanelHeader title="Live Custom Status Logs" description="Append real-time updates to the shipment timeline" />
        <div className="p-5">
          <div className="flex gap-2">
            <label htmlFor="custom-log" className="sr-only">New status update</label>
            <input
              id="custom-log"
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLog()}
              placeholder='e.g. "Shipment arrived at Casablanca Port"'
              className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm placeholder:text-navy-400 focus:border-accent-400"
            />
            <Button onClick={addLog} disabled={!newLog.trim()}>
              <Plus className="h-4 w-4" aria-hidden="true" />Append
            </Button>
          </div>

          <ul className="mt-5 space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                  <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="flex-1 rounded-lg border border-navy-100 bg-navy-50/50 px-3 py-2">
                  <p className="text-sm font-medium text-navy-900">{log.message}</p>
                  <p className="text-xs text-navy-500">{log.timestamp} · {log.author}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}

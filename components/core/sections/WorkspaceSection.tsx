"use client";

import { useState } from "react";
import { Boxes, Check, Handshake, Ship, Truck, Warehouse } from "lucide-react";
import {
  SUPPLY_CHAIN_STAGES,
  type CurrencyCode,
  type PipelineRecord,
} from "@/lib/core/types";
import { pipeline } from "@/lib/core/data";
import { formatMoney } from "@/lib/core/i18n";
import { Badge, Panel, PanelHeader, StatBlock } from "../ui";

export function WorkspaceSection({ currency }: { currency: CurrencyCode }) {
  const [activeId, setActiveId] = useState<string>(pipeline[0]?.id ?? "");
  const active = pipeline.find((p) => p.id === activeId);
  const stageIndex = active ? SUPPLY_CHAIN_STAGES.indexOf(active.stage) : 0;

  const counts = {
    orders: pipeline.length,
    deals: pipeline.filter((p) => ["Negotiation", "Manufacturing/Production"].includes(p.stage)).length,
    shipments: pipeline.filter((p) => p.stage === "Freight/Shipping").length,
    storage: pipeline.filter((p) => p.stage === "Warehousing/Storage").length,
    trips: pipeline.filter((p) => p.stage === "Last-Mile Transport").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatBlock label="Orders" value={counts.orders.toString()} icon={<Boxes className="h-5 w-5" />} accent />
        <StatBlock label="Active Deals" value={counts.deals.toString()} icon={<Handshake className="h-5 w-5" />} />
        <StatBlock label="Shipments" value={counts.shipments.toString()} icon={<Ship className="h-5 w-5" />} />
        <StatBlock label="In Storage" value={counts.storage.toString()} icon={<Warehouse className="h-5 w-5" />} />
        <StatBlock label="Freight Trips" value={counts.trips.toString()} icon={<Truck className="h-5 w-5" />} />
      </div>

      {/* Master timeline */}
      <Panel>
        <PanelHeader
          title="Global Supply Chain Master Timeline"
          description="End-to-end pipeline across all tenant systems"
          action={
            <select
              aria-label="Select operation"
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            >
              {pipeline.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.product}</option>)}
            </select>
          }
        />
        {active && (
          <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-navy-600">
              <span>Buyer: <span className="font-semibold text-navy-900">{active.buyerName}</span></span>
              <span>Supplier: <span className="font-semibold text-navy-900">{active.supplierName}</span></span>
              <span>Value: <span className="font-semibold text-accent-600">{formatMoney(active.valuation, currency)}</span></span>
            </div>

            {/* Horizontal stepper */}
            <div className="overflow-x-auto pb-2">
              <ol className="flex min-w-[900px] items-start">
                {SUPPLY_CHAIN_STAGES.map((stage, i) => {
                  const done = i <= stageIndex;
                  const current = i === stageIndex;
                  return (
                    <li key={stage} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : i <= stageIndex ? "bg-accent-500" : "bg-navy-100"}`} aria-hidden="true" />
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          done ? "border-accent-500 bg-accent-500 text-white" : "border-navy-200 bg-white text-navy-400"
                        }`}>
                          {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                        </span>
                        <span className={`h-0.5 flex-1 ${i === SUPPLY_CHAIN_STAGES.length - 1 ? "opacity-0" : i < stageIndex ? "bg-accent-500" : "bg-navy-100"}`} aria-hidden="true" />
                      </div>
                      <span className={`mt-2 max-w-[100px] text-center text-[11px] font-medium leading-tight ${current ? "text-accent-600" : done ? "text-navy-900" : "text-navy-400"}`}>
                        {stage}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </Panel>

      {/* Consolidated pipeline table */}
      <Panel>
        <PanelHeader title="All Active Operations" description="Orders, deals, shipments, storage & trips" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Operation</th>
                <th className="px-5 py-3 font-semibold">Buyer</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Stage</th>
                <th className="px-5 py-3 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {pipeline.map((p) => (
                <tr key={p.id} className="cursor-pointer hover:bg-navy-50/60" onClick={() => setActiveId(p.id)}>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-navy-900">{p.product}</div>
                    <div className="text-xs text-navy-500">{p.id}</div>
                  </td>
                  <td className="px-5 py-3 text-navy-700">{p.buyerName}</td>
                  <td className="px-5 py-3 text-navy-700">{p.supplierName}</td>
                  <td className="px-5 py-3"><Badge tone="info">{p.stage}</Badge></td>
                  <td className="px-5 py-3 font-semibold text-accent-600">{formatMoney(p.valuation, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

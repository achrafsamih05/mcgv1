"use client";

import { useMemo, useState } from "react";
import { Route, Search, SlidersHorizontal, XCircle } from "lucide-react";
import type { LogisticsOrder, OrderStage } from "@/lib/admin/types";
import { orders as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const stages: OrderStage[] = [
  "Request Received",
  "Supplier Found",
  "Negotiation",
  "Production",
  "Shipping",
  "Arrived",
  "Delivered",
];

const stageTone = (stage: OrderStage): Parameters<typeof Badge>[0]["tone"] => {
  if (stage === "Delivered") return "success";
  if (stage === "Shipping" || stage === "Arrived") return "accent";
  if (stage === "Negotiation") return "warning";
  return "info";
};

export function OrdersSection() {
  const [list, setList] = useState<LogisticsOrder[]>(seed);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<OrderStage | "All">("All");

  const filtered = useMemo(
    () =>
      list.filter(
        (o) =>
          (stageFilter === "All" || o.stage === stageFilter) &&
          (o.buyer.toLowerCase().includes(query.toLowerCase()) ||
            o.supplier.toLowerCase().includes(query.toLowerCase()) ||
            o.product.toLowerCase().includes(query.toLowerCase()) ||
            o.id.toLowerCase().includes(query.toLowerCase()))
      ),
    [list, query, stageFilter]
  );

  const overrideStage = (id: string, stage: OrderStage) =>
    setList((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));

  return (
    <Panel>
      <PanelHeader
        title="Import Pipelines"
        description={`${filtered.length} orders`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="order-search" className="sr-only">Search orders</label>
              <input
                id="order-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buyer, supplier, product…"
                className="w-56 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <select
              aria-label="Filter by stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as OrderStage | "All")}
              className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            >
              <option value="All">All Stages</option>
              {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Buyer</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Route</th>
              <th className="px-5 py-3 font-semibold">Value</th>
              <th className="px-5 py-3 font-semibold">Stage Override</th>
              <th className="px-5 py-3 text-right font-semibold">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="font-semibold text-navy-900">{o.product}</div>
                  <div className="text-xs text-navy-500">{o.id} · {o.updatedAt}</div>
                </td>
                <td className="px-5 py-3 text-navy-700">{o.buyer}</td>
                <td className="px-5 py-3 text-navy-700">{o.supplier}</td>
                <td className="px-5 py-3 text-navy-600">{o.origin} → {o.destination}</td>
                <td className="px-5 py-3 font-medium text-navy-900">${o.value.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={stageTone(o.stage)}>{o.stage}</Badge>
                    <select
                      aria-label={`Override stage for ${o.id}`}
                      value={o.stage}
                      onChange={(e) => overrideStage(o.id, e.target.value as OrderStage)}
                      className="cursor-pointer rounded-md border border-navy-200 px-2 py-1 text-xs focus:border-accent-400"
                    >
                      {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="sm"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Edit</Button>
                    <Button variant="secondary" size="sm"><Route className="h-4 w-4" aria-hidden="true" />Force-Route</Button>
                    <Button variant="danger" size="sm"><XCircle className="h-4 w-4" aria-hidden="true" />Close</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

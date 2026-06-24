"use client";

import { useState } from "react";
import { CheckCircle2, Gavel, Lock, XCircle } from "lucide-react";
import type { Deal, DealStatus } from "@/lib/admin/types";
import { deals as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const statusTone: Record<DealStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Negotiating: "info",
  "Escrow Held": "warning",
  Released: "success",
  Cancelled: "neutral",
  Mediation: "danger",
};

export function DealsSection() {
  const [list, setList] = useState<Deal[]>(seed);

  const set = (id: string, status: DealStatus) =>
    setList((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  const totalHeld = list
    .filter((d) => d.status === "Escrow Held")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Active Deals" value={list.length.toString()} />
        <SummaryTile label="In Escrow" value={`$${totalHeld.toLocaleString()}`} accent />
        <SummaryTile label="In Mediation" value={list.filter((d) => d.status === "Mediation").length.toString()} danger />
        <SummaryTile label="Released" value={list.filter((d) => d.status === "Released").length.toString()} success />
      </div>

      <Panel>
        <PanelHeader title="Escrow Contracts" description="Active negotiations & monetary contracts" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Deal</th>
                <th className="px-5 py-3 font-semibold">Buyer</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {list.map((d) => (
                <tr key={d.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-navy-900">{d.id}</div>
                    <div className="text-xs text-navy-500">{d.createdAt}</div>
                  </td>
                  <td className="px-5 py-3 text-navy-700">{d.buyer}</td>
                  <td className="px-5 py-3 text-navy-700">{d.supplier}</td>
                  <td className="px-5 py-3 font-medium text-navy-900">${d.amount.toLocaleString()}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone[d.status]}>{d.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="success" size="sm" onClick={() => set(d.id, "Released")}>
                        <Lock className="h-4 w-4" aria-hidden="true" />Release Escrow
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => set(d.id, "Negotiating")}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />Close
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => set(d.id, "Mediation")}>
                        <Gavel className="h-4 w-4" aria-hidden="true" />Mediate
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => set(d.id, "Cancelled")}>
                        <XCircle className="h-4 w-4" aria-hidden="true" />Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  danger,
  success,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  success?: boolean;
}) {
  const tone = accent
    ? "text-accent-600"
    : danger
    ? "text-red-600"
    : success
    ? "text-emerald-600"
    : "text-navy-900";
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

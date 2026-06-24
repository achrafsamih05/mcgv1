"use client";

import { useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import {
  ESCROW_STATES,
  type CurrencyCode,
  type EscrowContract,
  type EscrowState,
} from "@/lib/core/types";
import { escrowContracts } from "@/lib/core/data";
import { formatMoney } from "@/lib/core/i18n";
import { Badge, Button, Panel, PanelHeader, type Tone } from "../ui";

const stateTone: Record<EscrowState, Tone> = {
  Open: "neutral",
  "In Negotiation": "warning",
  "Agreed/Contracted": "info",
  "In Progress/Execution": "accent",
  Completed: "success",
  Cancelled: "danger",
};

// Deterministic FSM: which states can follow the current one.
const TRANSITIONS: Record<EscrowState, EscrowState[]> = {
  Open: ["In Negotiation", "Cancelled"],
  "In Negotiation": ["Agreed/Contracted", "Cancelled"],
  "Agreed/Contracted": ["In Progress/Execution", "Cancelled"],
  "In Progress/Execution": ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export function EscrowSection({ currency }: { currency: CurrencyCode }) {
  const [contracts, setContracts] = useState<EscrowContract[]>(escrowContracts);

  const advance = (id: string, next: EscrowState) =>
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, state: next } : c)));

  return (
    <div className="space-y-5">
      {/* FSM legend */}
      <Panel className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-500">Deal Finite-State Machine</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {ESCROW_STATES.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <Badge tone={stateTone[s]}>{s}</Badge>
              {i < ESCROW_STATES.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-navy-300" aria-hidden="true" />}
            </span>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Escrow Contracts" description={`${contracts.length} deals in the ledger`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Deal</th>
                <th className="px-5 py-3 font-semibold">Buyer</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Valuation</th>
                <th className="px-5 py-3 font-semibold">Docs</th>
                <th className="px-5 py-3 font-semibold">State</th>
                <th className="px-5 py-3 text-right font-semibold">Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-navy-900">{c.id}</div>
                    <div className="text-xs text-navy-500">{c.createdAt}</div>
                  </td>
                  <td className="px-5 py-3 text-navy-700">{c.buyerName}</td>
                  <td className="px-5 py-3 text-navy-700">{c.supplierName}</td>
                  <td className="px-5 py-3 font-semibold text-accent-600">{formatMoney(c.grossValuation, currency)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-navy-500">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />{c.documentIds.length}
                    </span>
                  </td>
                  <td className="px-5 py-3"><Badge tone={stateTone[c.state]}>{c.state}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      {TRANSITIONS[c.state].length === 0 ? (
                        <span className="text-xs text-navy-400">Final</span>
                      ) : (
                        TRANSITIONS[c.state].map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            variant={next === "Cancelled" ? "ghost" : "secondary"}
                            onClick={() => advance(c.id, next)}
                          >
                            {next === "Cancelled" ? "Cancel" : `→ ${next.split("/")[0]}`}
                          </Button>
                        ))
                      )}
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

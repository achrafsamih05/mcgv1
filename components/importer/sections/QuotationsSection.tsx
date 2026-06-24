"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Plane, Ship, X } from "lucide-react";
import type {
  DealContract,
  SourcingRFQ,
  SupplierQuotation,
} from "@/lib/importer/types";
import { can, scopeToUser, type ImporterSession } from "@/lib/importer/rbac";
import { Badge, Button, Panel, PanelHeader } from "../ui";

export function QuotationsSection({
  session,
  rfqs,
  quotations,
  deals,
  focusRfqId,
}: {
  session: ImporterSession;
  rfqs: SourcingRFQ[];
  quotations: SupplierQuotation[];
  deals: DealContract[];
  focusRfqId: string | null;
}) {
  const scopedRfqs = useMemo(
    () => scopeToUser(session, rfqs).filter((r) => r.quotationCount > 0),
    [session, rfqs]
  );
  const scopedQuotes = useMemo(() => scopeToUser(session, quotations), [session, quotations]);
  const scopedDeals = useMemo(() => scopeToUser(session, deals), [session, deals]);

  const [selectedRfq, setSelectedRfq] = useState<string>(
    focusRfqId ?? scopedRfqs[0]?.id ?? ""
  );
  const [quotes, setQuotes] = useState<SupplierQuotation[]>(scopedQuotes);

  const rfq = scopedRfqs.find((r) => r.id === selectedRfq);
  const rowQuotes = quotes.filter((q) => q.rfqId === selectedRfq);
  const canRespond = can(session, "quotation:respond");

  const respond = (id: string, status: SupplierQuotation["status"]) =>
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));

  const statusTone: Record<SupplierQuotation["status"], Parameters<typeof Badge>[0]["tone"]> = {
    Pending: "neutral",
    Accepted: "success",
    Declined: "danger",
    "Modification Requested": "warning",
  };

  return (
    <div className="space-y-5">
      {/* RFQ selector */}
      <Panel className="p-4">
        <label htmlFor="rfq-pick" className="mb-1.5 block text-sm font-medium text-navy-800">Select RFQ to compare offers</label>
        <select
          id="rfq-pick"
          value={selectedRfq}
          onChange={(e) => setSelectedRfq(e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 sm:max-w-md"
        >
          {scopedRfqs.map((r) => <option key={r.id} value={r.id}>{r.title} ({r.quotationCount} offers)</option>)}
        </select>
      </Panel>

      {/* Comparison */}
      {rfq ? (
        <Panel>
          <PanelHeader title={`Competing Offers — ${rfq.title}`} description={`Target budget $${rfq.targetBudget.toLocaleString()} · ${rfq.quantity.toLocaleString()} units`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                  <th className="px-5 py-3 font-semibold">Supplier</th>
                  <th className="px-5 py-3 font-semibold">Unit Price</th>
                  <th className="px-5 py-3 font-semibold">Est. Total</th>
                  <th className="px-5 py-3 font-semibold">Lead Time</th>
                  <th className="px-5 py-3 font-semibold">Shipping</th>
                  <th className="px-5 py-3 font-semibold">Remarks</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {rowQuotes.map((q) => (
                  <tr key={q.id} className="align-top hover:bg-navy-50/60">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-navy-900">{q.supplierName}</div>
                      <div className="text-xs text-navy-500">{q.supplierCountry}</div>
                      <div className="mt-1"><Badge tone={statusTone[q.status]}>{q.status}</Badge></div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-accent-600">${q.unitPrice}</td>
                    <td className="px-5 py-3 font-medium text-navy-900">${(q.unitPrice * q.quantity).toLocaleString()}</td>
                    <td className="px-5 py-3 text-navy-700">{q.productionDays} days</td>
                    <td className="px-5 py-3 text-navy-700">
                      <span className="inline-flex items-center gap-1">
                        {q.shippingMode === "Air" ? <Plane className="h-3.5 w-3.5" aria-hidden="true" /> : <Ship className="h-3.5 w-3.5" aria-hidden="true" />}
                        {q.shippingDays}d
                      </span>
                    </td>
                    <td className="px-5 py-3 max-w-[220px] text-xs text-navy-600">{q.remarks}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-end gap-1.5">
                        <Button size="sm" variant="success" disabled={!canRespond || q.status === "Accepted"} onClick={() => respond(q.id, "Accepted")}>
                          <Check className="h-4 w-4" aria-hidden="true" />Accept
                        </Button>
                        <Button size="sm" variant="secondary" disabled={!canRespond} onClick={() => respond(q.id, "Modification Requested")}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />Modify
                        </Button>
                        <Button size="sm" variant="ghost" disabled={!canRespond} onClick={() => respond(q.id, "Declined")}>
                          <X className="h-4 w-4" aria-hidden="true" />Decline
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rowQuotes.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-navy-400">No quotations yet for this RFQ.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <Panel><div className="p-12 text-center text-navy-400">No RFQs with quotations yet.</div></Panel>
      )}

      {/* Active deals */}
      <Panel>
        <PanelHeader title="Active Contracts" description="Executed deals from accepted offers" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {scopedDeals.map((d) => (
            <div key={d.id} className="rounded-xl border border-navy-100 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-navy-900">{d.id}</span>
                <Badge tone="success">Executed</Badge>
              </div>
              <p className="mt-1 text-sm text-navy-700">{d.rfqTitle}</p>
              <dl className="mt-3 space-y-1 text-xs text-navy-600">
                <div className="flex justify-between"><dt>Supplier</dt><dd className="font-medium text-navy-900">{d.supplierName}</dd></div>
                <div className="flex justify-between"><dt>Country</dt><dd className="font-medium text-navy-900">{d.supplierCountry}</dd></div>
                <div className="flex justify-between"><dt>Valuation</dt><dd className="font-semibold text-accent-600">${d.valuation.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt>Executed</dt><dd className="font-medium text-navy-900">{d.executedAt}</dd></div>
              </dl>
            </div>
          ))}
          {scopedDeals.length === 0 && <p className="col-span-full py-8 text-center text-navy-400">No active contracts yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

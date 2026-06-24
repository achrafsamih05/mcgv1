"use client";

import { useMemo, useState } from "react";
import { FileText, Paperclip, Plus, Search } from "lucide-react";
import type { RFQStatus, SourcingRFQ } from "@/lib/importer/types";
import { scopeToUser, type ImporterSession } from "@/lib/importer/rbac";
import { Badge, Button, Panel, PanelHeader, rfqStatusTone } from "../ui";

const STATUSES: RFQStatus[] = [
  "New",
  "In Review",
  "Supplier Matched",
  "Quotations Received",
  "Offer Accepted",
  "Closed",
];

export function RfqsSection({
  session,
  rfqs,
  onNewRFQ,
  onViewQuotes,
}: {
  session: ImporterSession;
  rfqs: SourcingRFQ[];
  onNewRFQ: () => void;
  onViewQuotes: (rfqId: string) => void;
}) {
  const scoped = useMemo(() => scopeToUser(session, rfqs), [session, rfqs]);
  const [filter, setFilter] = useState<RFQStatus | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      scoped.filter(
        (r) =>
          (filter === "All" || r.status === filter) &&
          (r.title.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()))
      ),
    [scoped, filter, query]
  );

  return (
    <Panel>
      <PanelHeader
        title="Sourcing Requests"
        description={`${filtered.length} of ${scoped.length} RFQs`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="rfq-search" className="sr-only">Search RFQs</label>
              <input id="rfq-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search RFQs…" className="w-48 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm focus:border-accent-400" />
            </div>
            <select aria-label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value as RFQStatus | "All")} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              <option value="All">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button onClick={onNewRFQ}><Plus className="h-4 w-4" aria-hidden="true" />New RFQ</Button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">Request</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Quantity</th>
              <th className="px-5 py-3 font-semibold">Budget</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Quotations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="font-semibold text-navy-900">{r.title}</div>
                  <div className="flex items-center gap-2 text-xs text-navy-500">
                    {r.id} · {r.createdAt}
                    {r.attachments > 0 && <span className="inline-flex items-center gap-0.5"><Paperclip className="h-3 w-3" aria-hidden="true" />{r.attachments}</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-navy-700">{r.category}</td>
                <td className="px-5 py-3 text-navy-700">{r.quantity.toLocaleString()}</td>
                <td className="px-5 py-3 font-medium text-navy-900">${r.targetBudget.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge tone={rfqStatusTone(r.status)}>{r.status}</Badge></td>
                <td className="px-5 py-3 text-right">
                  {r.quotationCount > 0 ? (
                    <Button size="sm" variant="secondary" onClick={() => onViewQuotes(r.id)}>
                      <FileText className="h-4 w-4" aria-hidden="true" />{r.quotationCount} offers
                    </Button>
                  ) : (
                    <span className="text-xs text-navy-400">Awaiting</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-navy-400">No RFQs match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

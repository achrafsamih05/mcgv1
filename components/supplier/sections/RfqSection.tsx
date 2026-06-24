"use client";

import { useMemo, useState } from "react";
import { Check, FileText, Search, Send, X } from "lucide-react";
import type {
  IncomingRequest,
  Quotation,
  RequestStatus,
} from "@/lib/supplier/types";
import { can, scopeToTenant, type SupplierSession } from "@/lib/supplier/rbac";
import { Badge, Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

const statusTone: Record<RequestStatus, Parameters<typeof Badge>[0]["tone"]> = {
  New: "accent",
  Accepted: "success",
  Rejected: "neutral",
  Quoted: "info",
};

type QuoteForm = {
  unitPrice: string;
  productionDays: string;
  shippingDays: string;
  terms: string;
};

const emptyQuote: QuoteForm = { unitPrice: "", productionDays: "", shippingDays: "", terms: "" };

export function RfqSection({
  session,
  seedRequests,
}: {
  session: SupplierSession;
  seedRequests: IncomingRequest[];
}) {
  const [requests, setRequests] = useState<IncomingRequest[]>(() =>
    scopeToTenant(session, seedRequests)
  );
  const [filter, setFilter] = useState<RequestStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [quoteTarget, setQuoteTarget] = useState<IncomingRequest | null>(null);
  const [quote, setQuote] = useState<QuoteForm>(emptyQuote);
  const [sentQuotes, setSentQuotes] = useState<Quotation[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteForm, string>>>({});

  const canEmit = can(session, "quotation:emit");

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (filter === "All" || r.status === filter) &&
          (r.productName.toLowerCase().includes(query.toLowerCase()) ||
            r.buyerName.toLowerCase().includes(query.toLowerCase()))
      ),
    [requests, filter, query]
  );

  const setStatus = (id: string, status: RequestStatus) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const openQuote = (r: IncomingRequest) => {
    setQuoteTarget(r);
    setQuote(emptyQuote);
    setErrors({});
  };

  const submitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteTarget) return;
    const errs: Partial<Record<keyof QuoteForm, string>> = {};
    if (!quote.unitPrice || Number(quote.unitPrice) <= 0) errs.unitPrice = "Enter a valid unit price.";
    if (!quote.productionDays || Number(quote.productionDays) <= 0) errs.productionDays = "Required.";
    if (!quote.shippingDays || Number(quote.shippingDays) <= 0) errs.shippingDays = "Required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const q: Quotation = {
      id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: quoteTarget.id,
      supplierId: session.supplierId,
      unitPrice: Number(quote.unitPrice),
      productionDays: Number(quote.productionDays),
      shippingDays: Number(quote.shippingDays),
      terms: quote.terms.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSentQuotes((prev) => [...prev, q]);
    setStatus(quoteTarget.id, "Quoted"); // immediate state update -> notifies buyer
    setQuoteTarget(null);
  };

  return (
    <Panel>
      <PanelHeader
        title="Incoming Buyer Requests"
        description={`${filtered.length} requests · ${sentQuotes.length} quotations sent`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="rfq-search" className="sr-only">Search requests</label>
              <input
                id="rfq-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search buyer or product…"
                className="w-52 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <select
              aria-label="Filter requests by status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as RequestStatus | "All")}
              className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            >
              {["All", "New", "Accepted", "Quoted", "Rejected"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        }
      />

      <ul className="divide-y divide-navy-100">
        {filtered.map((r) => (
          <li key={r.id} className="px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy-900">{r.productName}</span>
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                  <span className="text-xs text-navy-400">{r.id} · {r.receivedAt}</span>
                </div>
                <p className="mt-1 text-sm text-navy-600">
                  <span className="font-medium text-navy-800">{r.buyerName}</span> · {r.buyerCountry}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="text-navy-600">Qty: <span className="font-semibold text-navy-900">{r.quantity.toLocaleString()}</span></span>
                  <span className="text-navy-600">Target budget: <span className="font-semibold text-accent-600">${r.targetBudget.toLocaleString()}</span></span>
                </div>
                <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-600">{r.notes}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {r.status === "New" && (
                  <>
                    <Button variant="success" size="sm" onClick={() => setStatus(r.id, "Accepted")}>
                      <Check className="h-4 w-4" aria-hidden="true" />Accept
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setStatus(r.id, "Rejected")}>
                      <X className="h-4 w-4" aria-hidden="true" />Reject
                    </Button>
                  </>
                )}
                <Button size="sm" disabled={!canEmit} onClick={() => openQuote(r)}>
                  <FileText className="h-4 w-4" aria-hidden="true" />Send Quotation
                </Button>
              </div>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-5 py-12 text-center text-navy-400">No requests match the current filters.</li>
        )}
      </ul>

      {/* Dynamic Quotation Engine */}
      <Modal
        open={!!quoteTarget}
        onClose={() => setQuoteTarget(null)}
        title={`Quotation — ${quoteTarget?.productName ?? ""}`}
        size="md"
      >
        {quoteTarget && (
          <form onSubmit={submitQuote} className="space-y-4" noValidate>
            <div className="rounded-lg bg-navy-50 px-3 py-2.5 text-sm text-navy-600">
              To <span className="font-semibold text-navy-900">{quoteTarget.buyerName}</span> · {quoteTarget.quantity.toLocaleString()} units · target ${quoteTarget.targetBudget.toLocaleString()}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <QField label="Proposed Unit Price ($)" error={errors.unitPrice} required>
                <input type="number" value={quote.unitPrice} onChange={(e) => setQuote({ ...quote, unitPrice: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
              <QField label="Production (days)" error={errors.productionDays} required>
                <input type="number" value={quote.productionDays} onChange={(e) => setQuote({ ...quote, productionDays: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
              <QField label="Shipping (days)" error={errors.shippingDays} required>
                <input type="number" value={quote.shippingDays} onChange={(e) => setQuote({ ...quote, shippingDays: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
            </div>

            {quote.unitPrice && (
              <p className="text-sm text-navy-600">
                Estimated total:{" "}
                <span className="font-bold text-accent-600">
                  ${(Number(quote.unitPrice) * quoteTarget.quantity).toLocaleString()}
                </span>{" "}
                for {quoteTarget.quantity.toLocaleString()} units
              </p>
            )}

            <QField label="Contractual Terms / Notes">
              <textarea
                rows={3}
                value={quote.terms}
                onChange={(e) => setQuote({ ...quote, terms: e.target.value })}
                placeholder="Payment terms, incoterms, warranty, packaging…"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              />
            </QField>

            <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setQuoteTarget(null)}>Cancel</Button>
              <Button type="submit">
                <Send className="h-4 w-4" aria-hidden="true" />Dispatch Quotation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </Panel>
  );
}

function QField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-800">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

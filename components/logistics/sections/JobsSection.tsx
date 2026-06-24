"use client";

import { useMemo, useState } from "react";
import { Check, FileText, MapPin, Search, Send, Weight, X } from "lucide-react";
import type {
  FreightOrder,
  FreightStatus,
  LogisticsQuotation,
} from "@/lib/logistics/types";
import { can, scopeToTenant, type ProviderSession } from "@/lib/logistics/rbac";
import { Badge, Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

const statusTone: Record<FreightStatus, Parameters<typeof Badge>[0]["tone"]> = {
  New: "accent",
  Accepted: "success",
  Rejected: "neutral",
  Quoted: "info",
};

type QuoteForm = { price: string; deliveryDays: string; notes: string };
const emptyQuote: QuoteForm = { price: "", deliveryDays: "", notes: "" };

export function JobsSection({
  session,
  seedOrders,
}: {
  session: ProviderSession;
  seedOrders: FreightOrder[];
}) {
  const [orders, setOrders] = useState<FreightOrder[]>(() => scopeToTenant(session, seedOrders));
  const [filter, setFilter] = useState<FreightStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [quoteTarget, setQuoteTarget] = useState<FreightOrder | null>(null);
  const [quote, setQuote] = useState<QuoteForm>(emptyQuote);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteForm, string>>>({});
  const [sent, setSent] = useState<LogisticsQuotation[]>([]);

  const canEmit = can(session, "quotation:emit");

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === "All" || o.status === filter) &&
          (o.origin.toLowerCase().includes(query.toLowerCase()) ||
            o.destination.toLowerCase().includes(query.toLowerCase()) ||
            o.clientName.toLowerCase().includes(query.toLowerCase()) ||
            o.cargoType.toLowerCase().includes(query.toLowerCase()))
      ),
    [orders, filter, query]
  );

  const setStatus = (id: string, status: FreightStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const submitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteTarget) return;
    const errs: Partial<Record<keyof QuoteForm, string>> = {};
    if (!quote.price || Number(quote.price) <= 0) errs.price = "Enter a valid price.";
    if (!quote.deliveryDays || Number(quote.deliveryDays) <= 0) errs.deliveryDays = "Required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const q: LogisticsQuotation = {
      id: `LQ-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: quoteTarget.id,
      providerId: session.providerId,
      price: Number(quote.price),
      deliveryDays: Number(quote.deliveryDays),
      notes: quote.notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSent((prev) => [...prev, q]);
    setStatus(quoteTarget.id, "Quoted");
    setQuoteTarget(null);
    setQuote(emptyQuote);
  };

  return (
    <Panel>
      <PanelHeader
        title="Incoming Freight Requests"
        description={`${filtered.length} jobs · ${sent.length} quotations sent`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="job-search" className="sr-only">Search jobs</label>
              <input
                id="job-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Route, client, cargo…"
                className="w-52 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <select
              aria-label="Filter jobs by status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FreightStatus | "All")}
              className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            >
              {["All", "New", "Accepted", "Quoted", "Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />

      <ul className="divide-y divide-navy-100">
        {filtered.map((o) => (
          <li key={o.id} className="px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-navy-900">
                    <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />
                    {o.origin} → {o.destination}
                  </span>
                  <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                  <span className="text-xs text-navy-400">{o.id} · {o.receivedAt}</span>
                </div>
                <p className="mt-1 text-sm text-navy-600">
                  <span className="font-medium text-navy-800">{o.clientName}</span> · {o.clientCountry}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-navy-600">
                  <span>Cargo: <span className="font-medium text-navy-900">{o.cargoType}</span></span>
                  <span className="inline-flex items-center gap-1"><Weight className="h-3.5 w-3.5" aria-hidden="true" />{o.weightKg.toLocaleString()} kg</span>
                  <span>Volume: <span className="font-medium text-navy-900">{o.volumeM3} m³</span></span>
                  <span>Schedule: <span className="font-medium text-navy-900">{o.schedule}</span></span>
                </div>
                <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-600">{o.notes}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {o.status === "New" && (
                  <>
                    <Button variant="success" size="sm" onClick={() => setStatus(o.id, "Accepted")}>
                      <Check className="h-4 w-4" aria-hidden="true" />Accept
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setStatus(o.id, "Rejected")}>
                      <X className="h-4 w-4" aria-hidden="true" />Reject
                    </Button>
                  </>
                )}
                <Button size="sm" disabled={!canEmit} onClick={() => { setQuoteTarget(o); setQuote(emptyQuote); setErrors({}); }}>
                  <FileText className="h-4 w-4" aria-hidden="true" />Submit Quotation
                </Button>
              </div>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-5 py-12 text-center text-navy-400">No jobs match the current filters.</li>
        )}
      </ul>

      {/* Quotation payload */}
      <Modal open={!!quoteTarget} onClose={() => setQuoteTarget(null)} title={`Quotation — ${quoteTarget?.id ?? ""}`} size="md">
        {quoteTarget && (
          <form onSubmit={submitQuote} className="space-y-4" noValidate>
            <div className="rounded-lg bg-navy-50 px-3 py-2.5 text-sm text-navy-600">
              {quoteTarget.origin} → {quoteTarget.destination} · {quoteTarget.weightKg.toLocaleString()} kg · {quoteTarget.cargoType}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <QField label="Offer Price ($)" error={errors.price} required>
                <input type="number" value={quote.price} onChange={(e) => setQuote({ ...quote, price: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
              <QField label="Estimated Delivery (days)" error={errors.deliveryDays} required>
                <input type="number" value={quote.deliveryDays} onChange={(e) => setQuote({ ...quote, deliveryDays: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
            </div>
            <QField label="Logistical Notes / Terms">
              <textarea
                rows={3}
                value={quote.notes}
                onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                placeholder="Equipment, insurance, handling requirements…"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              />
            </QField>
            <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setQuoteTarget(null)}>Cancel</Button>
              <Button type="submit"><Send className="h-4 w-4" aria-hidden="true" />Dispatch Quotation</Button>
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

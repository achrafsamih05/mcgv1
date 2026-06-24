"use client";

import { useMemo, useState } from "react";
import { Check, FileText, Search, Send, X } from "lucide-react";
import {
  DEFAULT_ANCILLARY_SERVICES,
  type AncillaryServiceKey,
  type BookingQuotation,
  type BookingStatus,
  type SpaceBookingRequest,
} from "@/lib/warehouse/types";
import { can, scopeToTenant, type OperatorSession } from "@/lib/warehouse/rbac";
import { Badge, Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

const statusTone: Record<BookingStatus, Parameters<typeof Badge>[0]["tone"]> = {
  New: "accent",
  Accepted: "success",
  Rejected: "neutral",
  Quoted: "info",
};

type QuoteForm = {
  price: string;
  confirmedDays: string;
  notes: string;
  included: AncillaryServiceKey[];
};

const emptyQuote: QuoteForm = { price: "", confirmedDays: "", notes: "", included: [] };

export function BookingsSection({
  session,
  seedBookings,
}: {
  session: OperatorSession;
  seedBookings: SpaceBookingRequest[];
}) {
  const [bookings, setBookings] = useState<SpaceBookingRequest[]>(() => scopeToTenant(session, seedBookings));
  const [filter, setFilter] = useState<BookingStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [quoteTarget, setQuoteTarget] = useState<SpaceBookingRequest | null>(null);
  const [quote, setQuote] = useState<QuoteForm>(emptyQuote);
  const [errors, setErrors] = useState<Partial<Record<"price" | "confirmedDays", string>>>({});
  const [sent, setSent] = useState<BookingQuotation[]>([]);

  const canEmit = can(session, "quotation:emit");

  const filtered = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (filter === "All" || b.status === filter) &&
          (b.clientName.toLowerCase().includes(query.toLowerCase()) ||
            b.facilityName.toLowerCase().includes(query.toLowerCase()) ||
            b.cargoDescription.toLowerCase().includes(query.toLowerCase()))
      ),
    [bookings, filter, query]
  );

  const setStatus = (id: string, status: BookingStatus) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  const toggleInclude = (key: AncillaryServiceKey) =>
    setQuote((prev) => ({
      ...prev,
      included: prev.included.includes(key)
        ? prev.included.filter((k) => k !== key)
        : [...prev.included, key],
    }));

  const submitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteTarget) return;
    const errs: Partial<Record<"price" | "confirmedDays", string>> = {};
    if (!quote.price || Number(quote.price) <= 0) errs.price = "Enter a valid price.";
    if (!quote.confirmedDays || Number(quote.confirmedDays) <= 0) errs.confirmedDays = "Required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const q: BookingQuotation = {
      id: `BQ-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: quoteTarget.id,
      operatorId: session.operatorId,
      price: Number(quote.price),
      includedServices: quote.included,
      confirmedDays: Number(quote.confirmedDays),
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
        title="Incoming Booking Requests"
        description={`${filtered.length} requests · ${sent.length} quotations sent`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="bk-search" className="sr-only">Search bookings</label>
              <input id="bk-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Client, facility, cargo…" className="w-52 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400" />
            </div>
            <select aria-label="Filter bookings" value={filter} onChange={(e) => setFilter(e.target.value as BookingStatus | "All")} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {["All", "New", "Accepted", "Quoted", "Rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        }
      />

      <ul className="divide-y divide-navy-100">
        {filtered.map((b) => (
          <li key={b.id} className="px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy-900">{b.facilityName}</span>
                  <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                  <span className="text-xs text-navy-400">{b.id} · {b.receivedAt}</span>
                </div>
                <p className="mt-1 text-sm text-navy-600"><span className="font-medium text-navy-800">{b.clientName}</span> · {b.clientCountry}</p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-navy-600">
                  <span>Space: <span className="font-semibold text-navy-900">{b.spaceSqm.toLocaleString()} sqm</span></span>
                  <span>Duration: <span className="font-semibold text-navy-900">{b.durationDays} days</span></span>
                  <span>Start: <span className="font-semibold text-navy-900">{b.startDate}</span></span>
                </div>
                <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-600">{b.cargoDescription}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {b.status === "New" && (
                  <>
                    <Button variant="success" size="sm" onClick={() => setStatus(b.id, "Accepted")}><Check className="h-4 w-4" aria-hidden="true" />Accept</Button>
                    <Button variant="danger" size="sm" onClick={() => setStatus(b.id, "Rejected")}><X className="h-4 w-4" aria-hidden="true" />Reject</Button>
                  </>
                )}
                <Button size="sm" disabled={!canEmit} onClick={() => { setQuoteTarget(b); setQuote(emptyQuote); setErrors({}); }}>
                  <FileText className="h-4 w-4" aria-hidden="true" />Issue Quotation
                </Button>
              </div>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="px-5 py-12 text-center text-navy-400">No bookings match the current filters.</li>}
      </ul>

      {/* Quotation payload */}
      <Modal open={!!quoteTarget} onClose={() => setQuoteTarget(null)} title={`Quotation — ${quoteTarget?.id ?? ""}`} size="md">
        {quoteTarget && (
          <form onSubmit={submitQuote} className="space-y-4" noValidate>
            <div className="rounded-lg bg-navy-50 px-3 py-2.5 text-sm text-navy-600">
              {quoteTarget.clientName} · {quoteTarget.spaceSqm.toLocaleString()} sqm · {quoteTarget.durationDays} days from {quoteTarget.startDate}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <QField label="Final Custom Price ($)" error={errors.price} required>
                <input type="number" value={quote.price} onChange={(e) => setQuote({ ...quote, price: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
              <QField label="Confirmed Duration (days)" error={errors.confirmedDays} required>
                <input type="number" value={quote.confirmedDays} onChange={(e) => setQuote({ ...quote, confirmedDays: e.target.value })} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </QField>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-800">Included Services</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DEFAULT_ANCILLARY_SERVICES.map((s) => (
                  <label key={s.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 transition-colors duration-150 hover:bg-navy-50">
                    <input type="checkbox" checked={quote.included.includes(s.key)} onChange={() => toggleInclude(s.key)} className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <QField label="Operational Notes">
              <textarea rows={3} value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} placeholder="Access hours, handling terms, deposit…" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
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

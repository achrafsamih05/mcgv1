"use client";

import { useState } from "react";
import { Building2, Check, Star, Truck, Warehouse } from "lucide-react";
import type { DealContract } from "@/lib/importer/types";
import { scopeToUser, type ImporterSession } from "@/lib/importer/rbac";
import { Button, Panel, PanelHeader } from "../ui";

type Party = "supplier" | "fleet" | "warehouse";

const partyMeta: Record<Party, { label: string; icon: typeof Building2 }> = {
  supplier: { label: "Sourcing Supplier", icon: Building2 },
  fleet: { label: "Logistics Fleet Driver", icon: Truck },
  warehouse: { label: "Storage Warehouse Operator", icon: Warehouse },
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} stars`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="cursor-pointer p-0.5"
        >
          <Star className={`h-6 w-6 ${n <= (hover || value) ? "fill-accent-500 text-accent-500" : "fill-navy-100 text-navy-200"}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function PartyForm({ party }: { party: Party }) {
  const { label, icon: Icon } = partyMeta[party];
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
  };

  return (
    <div className="rounded-xl border border-navy-100 p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="font-semibold text-navy-900">Rate the {label}</h3>
      </div>

      {submitted ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <Check className="h-4 w-4" aria-hidden="true" />
          Thanks — your {rating}-star review was submitted.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Share your experience with the ${label.toLowerCase()}…`}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
          />
          <Button type="submit" disabled={rating === 0} className="w-full">Submit Review</Button>
        </form>
      )}
    </div>
  );
}

export function FeedbackSection({
  session,
  deals,
}: {
  session: ImporterSession;
  deals: DealContract[];
}) {
  const scoped = scopeToUser(session, deals);
  const [dealId, setDealId] = useState<string>(scoped[0]?.id ?? "");
  const deal = scoped.find((d) => d.id === dealId);

  return (
    <Panel>
      <PanelHeader
        title="Tri-Party Feedback"
        description="Rate each party from a completed deal"
        action={
          <select
            aria-label="Select deal"
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
            className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
          >
            {scoped.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.rfqTitle}</option>)}
          </select>
        }
      />
      {deal ? (
        <div className="p-5">
          <div className="mb-4 rounded-lg bg-navy-50 px-4 py-3 text-sm text-navy-600">
            Reviewing deal <span className="font-semibold text-navy-900">{deal.id}</span> · {deal.rfqTitle} · ${deal.valuation.toLocaleString()}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PartyForm party="supplier" />
            <PartyForm party="fleet" />
            <PartyForm party="warehouse" />
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-navy-400">No completed deals available for feedback.</div>
      )}
    </Panel>
  );
}

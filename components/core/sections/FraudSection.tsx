"use client";

import { useState } from "react";
import { Check, Flag, ShieldAlert } from "lucide-react";
import type { FraudCategory, FraudReport } from "@/lib/core/types";
import { Badge, Button, Panel, PanelHeader } from "../ui";

const CATEGORIES: FraudCategory[] = [
  "Fake Supplier",
  "Rogue Logistics Provider",
  "Non-compliant Warehouse",
  "Bot Reviews",
];

// Example entities a user could flag from across the platform.
const REPORTABLE_ENTITIES = [
  "Guangzhou AutoParts Co.",
  "Rapid Movers SARL",
  "Tangier Med Logistics",
  "Anonymous Reviewer #4471",
];

export function FraudSection() {
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [entity, setEntity] = useState(REPORTABLE_ENTITIES[0]);
  const [category, setCategory] = useState<FraudCategory>("Fake Supplier");
  const [details, setDetails] = useState("");
  const [flash, setFlash] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    const report: FraudReport = {
      id: `FR-${Math.floor(1000 + Math.random() * 9000)}`,
      targetEntity: entity,
      category,
      details: details.trim(),
      reportedAt: new Date().toISOString().slice(0, 10),
    };
    setReports((prev) => [report, ...prev]);
    setDetails("");
    setFlash(true);
    setTimeout(() => setFlash(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <Panel>
        <PanelHeader title="Submitted Reports" description={`${reports.length} integrity reports filed`} />
        {reports.length === 0 ? (
          <div className="p-12 text-center text-navy-400">
            <ShieldAlert className="mx-auto h-10 w-10 text-navy-200" aria-hidden="true" />
            <p className="mt-2 text-sm">No reports yet. Use the form to flag suspicious entities.</p>
          </div>
        ) : (
          <ul className="divide-y divide-navy-100">
            {reports.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-navy-900">{r.targetEntity}</span>
                  <Badge tone="danger">{r.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-navy-600">{r.details}</p>
                <p className="mt-1 text-xs text-navy-400">{r.id} · filed {r.reportedAt} · under integrity review</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="h-fit">
        <PanelHeader title="Report Suspicious Entity" />
        <form className="space-y-4 p-5" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Entity</label>
            <select value={entity} onChange={(e) => setEntity(e.target.value)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {REPORTABLE_ENTITIES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as FraudCategory)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Details</label>
            <textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the suspicious activity…" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
          </div>
          {flash && <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><Check className="h-4 w-4" aria-hidden="true" />Report submitted to the integrity team.</p>}
          <Button type="submit" variant="danger" className="w-full" disabled={!details.trim()}><Flag className="h-4 w-4" aria-hidden="true" />Submit Report</Button>
        </form>
      </Panel>
    </div>
  );
}

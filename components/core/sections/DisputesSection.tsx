"use client";

import { useState } from "react";
import { FileText, Gavel, ImageIcon, MessageSquare, Paperclip } from "lucide-react";
import type { CurrencyCode, DisputeCase, DisputeStatus } from "@/lib/core/types";
import { disputes as seed } from "@/lib/core/data";
import { formatMoney } from "@/lib/core/i18n";
import { Badge, Button, Panel, PanelHeader, type Tone } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

const statusTone: Record<DisputeStatus, Tone> = {
  Filed: "danger",
  "Under Review": "warning",
  Resolved: "success",
};

export function DisputesSection({ currency }: { currency: CurrencyCode }) {
  const [cases, setCases] = useState<DisputeCase[]>(seed);
  const [active, setActive] = useState<DisputeCase | null>(null);
  const [verdict, setVerdict] = useState("");
  const [showFile, setShowFile] = useState(false);

  const emitVerdict = () => {
    if (!active || !verdict.trim()) return;
    setCases((prev) => prev.map((c) => (c.id === active.id ? { ...c, status: "Resolved", verdict: verdict.trim() } : c)));
    setActive(null);
    setVerdict("");
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowFile(true)}><Gavel className="h-4 w-4" aria-hidden="true" />File a Grievance</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {cases.map((d) => (
          <Panel key={d.id} className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="info">{d.axis}</Badge>
              <Badge tone={statusTone[d.status]}>{d.status}</Badge>
            </div>
            <h3 className="mt-3 font-semibold text-navy-900">{d.subject}</h3>
            <p className="mt-1 text-sm text-navy-600">
              <span className="font-medium text-navy-800">{d.claimant}</span> vs <span className="font-medium text-navy-800">{d.respondent}</span>
            </p>
            <p className="mt-2 line-clamp-2 text-xs text-navy-500">{d.claimText}</p>
            <dl className="mt-3 flex items-center gap-4 text-xs text-navy-500">
              <span>Amount: <span className="font-semibold text-accent-600">{formatMoney(d.amount, currency)}</span></span>
              <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" />{d.evidence.length}</span>
            </dl>
            <Button className="mt-4 w-full" onClick={() => setActive(d)}><Gavel className="h-4 w-4" aria-hidden="true" />Open Inspection</Button>
          </Panel>
        ))}
      </div>

      {/* CEO side-by-side inspection */}
      <Modal open={!!active} onClose={() => { setActive(null); setVerdict(""); }} title={`Mediation — ${active?.id ?? ""}`} size="lg">
        {active && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{active.axis}</Badge>
              <Badge tone={statusTone[active.status]}>{active.status}</Badge>
              <span className="text-sm text-navy-600">{active.subject}</span>
            </div>
            <p className="rounded-lg bg-navy-50 px-3 py-2.5 text-sm text-navy-600">{active.claimText}</p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-navy-100">
                <p className="flex items-center gap-1.5 border-b border-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-700">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />Chat Trail
                </p>
                <div className="max-h-56 space-y-3 overflow-y-auto p-4">
                  {active.chatTrail.length === 0 && <p className="text-center text-sm text-navy-400">No messages on record.</p>}
                  {active.chatTrail.map((m) => (
                    <div key={m.id}>
                      <p className="text-[11px] font-semibold text-navy-500">{m.from} · {m.at}</p>
                      <p className="rounded-lg bg-navy-50 px-3 py-1.5 text-sm text-navy-800">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-navy-100">
                <p className="flex items-center gap-1.5 border-b border-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-700">
                  <FileText className="h-4 w-4" aria-hidden="true" />Evidence
                </p>
                <ul className="max-h-56 space-y-2 overflow-y-auto p-4">
                  {active.evidence.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 rounded-lg border border-navy-100 bg-navy-50/50 px-3 py-2 text-sm">
                      {e.kind === "photo" ? <ImageIcon className="h-4 w-4 text-navy-400" aria-hidden="true" /> : <FileText className="h-4 w-4 text-navy-400" aria-hidden="true" />}
                      <span className="flex-1 truncate text-navy-700">{e.label}</span>
                      <Button variant="ghost" size="sm">Inspect</Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="verdict" className="mb-1.5 block text-sm font-semibold text-navy-700">Final Binding Platform Verdict</label>
              <textarea id="verdict" rows={3} value={verdict} onChange={(e) => setVerdict(e.target.value)} placeholder="State the binding resolution…" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { setActive(null); setVerdict(""); }}>Cancel</Button>
                <Button disabled={!verdict.trim()} onClick={emitVerdict}><Gavel className="h-4 w-4" aria-hidden="true" />Emit Verdict</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* File grievance */}
      <Modal open={showFile} onClose={() => setShowFile(false)} title="File a Grievance" size="md">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowFile(false); }}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Dispute Against</label>
            <select className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              <option>Supplier</option><option>Driver</option><option>Warehouse</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Subject</label>
            <input className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" placeholder="Brief summary" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Claim Details</label>
            <textarea rows={3} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" placeholder="Describe the issue…" />
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 py-5 text-sm text-navy-500">
            <Paperclip className="h-5 w-5" aria-hidden="true" />Attach photos / documents
          </div>
          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowFile(false)}>Cancel</Button>
            <Button type="submit">Submit Grievance</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

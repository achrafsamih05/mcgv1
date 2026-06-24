"use client";

import { useState } from "react";
import { FileText, Gavel, MessageSquare, Paperclip } from "lucide-react";
import type { Dispute } from "@/lib/admin/types";
import { disputes as seed } from "@/lib/admin/data";
import { Badge, Button, Panel } from "../ui/primitives";
import { Modal } from "../ui/Modal";

const statusTone: Record<Dispute["status"], Parameters<typeof Badge>[0]["tone"]> = {
  Open: "danger",
  "Under Review": "warning",
  Resolved: "success",
};

// Demo chat history for the mediation view.
const chatLog = [
  { from: "claimant", name: "Karim Tazi", text: "The chairs arrived with broken frames, I want a refund.", time: "10:02" },
  { from: "respondent", name: "Foshan Home & Living", text: "We packed per spec. Damage likely occurred in transit.", time: "10:14" },
  { from: "claimant", name: "Karim Tazi", text: "Photos attached. 40 of 500 units affected.", time: "10:20" },
];

export function DisputesSection() {
  const [list, setList] = useState<Dispute[]>(seed);
  const [active, setActive] = useState<Dispute | null>(null);
  const [verdict, setVerdict] = useState("");

  const emitVerdict = () => {
    if (!active || !verdict.trim()) return;
    setList((prev) =>
      prev.map((d) => (d.id === active.id ? { ...d, status: "Resolved" } : d))
    );
    setActive(null);
    setVerdict("");
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <Panel key={d.id} className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="info">{d.axis}</Badge>
              <Badge tone={statusTone[d.status]}>{d.status}</Badge>
            </div>
            <h3 className="mt-3 font-semibold text-navy-900">{d.subject}</h3>
            <p className="mt-1 text-sm text-navy-600">
              <span className="font-medium text-navy-800">{d.claimant}</span> vs{" "}
              <span className="font-medium text-navy-800">{d.respondent}</span>
            </p>
            <dl className="mt-3 flex items-center gap-4 text-xs text-navy-500">
              <span>Amount: <span className="font-semibold text-navy-800">${d.amount.toLocaleString()}</span></span>
              <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" />{d.evidence} files</span>
              <span>Opened {d.openedAt}</span>
            </dl>
            <Button className="mt-4 w-full" onClick={() => setActive(d)}>
              <Gavel className="h-4 w-4" aria-hidden="true" />Open Mediation
            </Button>
          </Panel>
        ))}
      </div>

      <Modal
        open={!!active}
        onClose={() => { setActive(null); setVerdict(""); }}
        title={`Mediation — ${active?.id ?? ""}`}
        size="lg"
      >
        {active && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{active.axis}</Badge>
              <Badge tone={statusTone[active.status]}>{active.status}</Badge>
              <span className="text-sm text-navy-600">{active.subject}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Chat history */}
              <div className="rounded-xl border border-navy-100">
                <p className="flex items-center gap-1.5 border-b border-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-700">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />Chat History
                </p>
                <div className="max-h-64 space-y-3 overflow-y-auto p-4">
                  {chatLog.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "claimant" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "claimant" ? "bg-navy-100 text-navy-800" : "bg-accent-100 text-accent-900"}`}>
                        <p className="text-[11px] font-semibold opacity-70">{m.name} · {m.time}</p>
                        <p>{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence */}
              <div className="rounded-xl border border-navy-100">
                <p className="flex items-center gap-1.5 border-b border-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-700">
                  <FileText className="h-4 w-4" aria-hidden="true" />Evidence & Contracts
                </p>
                <ul className="max-h-64 space-y-2 overflow-y-auto p-4">
                  {Array.from({ length: active.evidence }).map((_, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg border border-navy-100 bg-navy-50/50 px-3 py-2 text-sm">
                      <Paperclip className="h-4 w-4 text-navy-400" aria-hidden="true" />
                      <span className="flex-1 truncate text-navy-700">evidence_{i + 1}.{i % 2 ? "pdf" : "jpg"}</span>
                      <Button variant="ghost" size="sm">Inspect</Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final verdict */}
            <div>
              <label htmlFor="verdict" className="mb-1.5 block text-sm font-semibold text-navy-700">
                Final Legally-Binding Platform Verdict
              </label>
              <textarea
                id="verdict"
                rows={3}
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                placeholder="State the binding resolution and any escrow split…"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { setActive(null); setVerdict(""); }}>Cancel</Button>
                <Button variant="primary" disabled={!verdict.trim()} onClick={emitVerdict}>
                  <Gavel className="h-4 w-4" aria-hidden="true" />Emit Final Verdict
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

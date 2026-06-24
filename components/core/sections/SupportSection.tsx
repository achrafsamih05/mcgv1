"use client";

import { useState } from "react";
import { Check, Plus, Send } from "lucide-react";
import type {
  SupportTicket,
  TicketCategory,
  TicketStatus,
} from "@/lib/core/types";
import { tickets as seed } from "@/lib/core/data";
import { Badge, Button, Panel, PanelHeader, type Tone } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

const statusTone: Record<TicketStatus, Tone> = {
  Open: "accent",
  Routed: "info",
  "Awaiting Reply": "warning",
  Resolved: "success",
};

const DIVISIONS = ["Platform Engineering", "Finance", "Logistics Ops", "Compliance", "Account Success"];
const CATEGORIES: TicketCategory[] = ["Account", "Payments", "Logistics", "Technical", "Dispute"];

export function SupportSection() {
  const [list, setList] = useState<SupportTicket[]>(seed);
  const [view, setView] = useState<"user" | "staff">("user");
  const [activeId, setActiveId] = useState<string>(seed[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const active = list.find((t) => t.id === activeId);

  const sendReply = () => {
    if (!active || !reply.trim()) return;
    setList((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, status: view === "staff" ? "Awaiting Reply" : "Open", replies: [...t.replies, { id: `r${Date.now()}`, from: view === "staff" ? "staff" : "user", text: reply.trim(), at: "now" }] }
          : t
      )
    );
    setReply("");
  };

  const route = (id: string, division: string) =>
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Routed", assignedDivision: division } : t)));
  const resolve = (id: string) =>
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Resolved" } : t)));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-navy-200 bg-white p-1">
          {(["user", "staff"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${view === v ? "bg-accent-500 text-white" : "text-navy-600 hover:bg-navy-50"}`}>
              {v === "user" ? "My Tickets" : "Staff Desk"}
            </button>
          ))}
        </div>
        {view === "user" && <Button onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" />New Ticket</Button>}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <Panel className="h-fit">
          <div className="border-b border-navy-100 px-4 py-3"><h2 className="text-sm font-semibold text-navy-900">Tickets</h2></div>
          <ul className="divide-y divide-navy-100">
            {list.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setActiveId(t.id)} className={`flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-colors duration-150 ${activeId === t.id ? "bg-accent-50" : "hover:bg-navy-50"}`}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-navy-900">{t.subject}</span>
                    <Badge tone={statusTone[t.status]}>{t.status}</Badge>
                  </span>
                  <span className="text-xs text-navy-500">{t.id} · {t.category} · {t.openedBy}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {active ? (
          <Panel>
            <PanelHeader
              title={active.subject}
              description={`${active.id} · ${active.category}${active.assignedDivision ? ` · ${active.assignedDivision}` : ""}`}
              action={
                view === "staff" ? (
                  <div className="flex flex-wrap gap-2">
                    <select aria-label="Route to division" defaultValue="" onChange={(e) => e.target.value && route(active.id, e.target.value)} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                      <option value="" disabled>Route to…</option>
                      {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Button variant="success" size="sm" onClick={() => resolve(active.id)}><Check className="h-4 w-4" aria-hidden="true" />Resolve</Button>
                  </div>
                ) : (
                  active.status !== "Resolved" && <Button variant="secondary" size="sm" onClick={() => resolve(active.id)}>Close Ticket</Button>
                )
              }
            />
            <div className="space-y-3 p-5">
              {active.replies.map((r) => (
                <div key={r.id} className={`flex ${r.from === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${r.from === "user" ? "bg-navy-100 text-navy-800" : "bg-accent-500 text-white"}`}>
                    <p className="text-[11px] font-semibold opacity-70">{r.from === "user" ? active.openedBy : "Support Staff"}</p>
                    <p>{r.text}</p>
                    <p className={`mt-1 text-[10px] ${r.from === "user" ? "text-navy-400" : "text-white/70"}`}>{r.at}</p>
                  </div>
                </div>
              ))}
              {active.status !== "Resolved" && (
                <div className="flex gap-2 border-t border-navy-100 pt-4">
                  <label htmlFor="ticket-reply" className="sr-only">Reply</label>
                  <input id="ticket-reply" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} placeholder="Write a reply…" className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
                  <Button onClick={sendReply} disabled={!reply.trim()}><Send className="h-4 w-4" aria-hidden="true" />Send</Button>
                </div>
              )}
            </div>
          </Panel>
        ) : (
          <Panel><div className="p-12 text-center text-navy-400">Select a ticket.</div></Panel>
        )}
      </div>

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="New Support Ticket" size="md">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setComposeOpen(false); }}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Subject</label>
            <input className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" placeholder="Brief summary" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Category</label>
            <select className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Description</label>
            <textarea rows={4} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" placeholder="Describe your issue…" required />
          </div>
          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

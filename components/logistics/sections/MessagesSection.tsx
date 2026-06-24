"use client";

import { useState } from "react";
import { Camera, FileText, Image as ImageIcon, Paperclip, Send, ShieldCheck } from "lucide-react";
import type { ChatMessage, ChatThread } from "@/lib/logistics/types";
import { scopeToTenant, type ProviderSession } from "@/lib/logistics/rbac";
import { Badge, Button, Panel } from "../ui";

export function MessagesSection({
  session,
  seedThreads,
}: {
  session: ProviderSession;
  seedThreads: ChatThread[];
}) {
  const [threads, setThreads] = useState<ChatThread[]>(() => scopeToTenant(session, seedThreads));
  const [activeId, setActiveId] = useState<string>(threads[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const active = threads.find((t) => t.id === activeId);

  const select = (id: string) => {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = () => {
    if (!draft.trim() || !active) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      threadId: active.id,
      from: "provider",
      text: draft.trim(),
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setThreads((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, msg], lastPreview: msg.text } : t))
    );
    setDraft("");
  };

  const bubbleAlign = (from: ChatMessage["from"]) => (from === "provider" ? "justify-end" : "justify-start");
  const bubbleStyle = (from: ChatMessage["from"]) =>
    from === "provider" ? "bg-accent-500 text-white" : from === "support" ? "bg-navy-900 text-white" : "bg-white text-navy-800 shadow-sm";

  return (
    <Panel className="overflow-hidden">
      <div className="grid h-[640px] grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Threads */}
        <div className="flex flex-col border-b border-navy-100 md:border-b-0 md:border-r">
          <div className="border-b border-navy-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-navy-900">Conversations</h2>
            <p className="text-xs text-navy-500">{threads.length} channels</p>
          </div>
          <ul className="flex-1 divide-y divide-navy-100 overflow-y-auto">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => select(t.id)}
                  className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                    activeId === t.id ? "bg-accent-50" : "hover:bg-navy-50"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${t.kind === "Platform Support" ? "bg-navy-900" : "bg-accent-500"}`}>
                    {t.party.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-navy-900">{t.party}</span>
                      {t.unread > 0 && <span className="rounded-full bg-accent-500 px-1.5 text-[11px] font-bold text-white">{t.unread}</span>}
                    </span>
                    <span className="truncate text-xs text-navy-500">{t.lastPreview}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Conversation */}
        {active ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-navy-900">{active.party}</p>
                <p className="text-xs text-navy-500">{active.kind}</p>
              </div>
              <Badge tone="success">Secure channel</Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-navy-50/40 p-5">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex ${bubbleAlign(m.from)}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${bubbleStyle(m.from)}`}>
                    <p>{m.text}</p>
                    {m.attachments?.map((a) => (
                      <span key={a.id} className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1 text-xs">
                        {a.kind === "image" ? <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                        {a.name}
                      </span>
                    ))}
                    <span className={`mt-1 block text-[10px] ${m.from === "client" ? "text-navy-400" : "text-white/70"}`}>{m.at}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer with proof-of-delivery capture */}
            <div className="border-t border-navy-100 p-3">
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Attach document" className="cursor-pointer rounded-lg p-2 text-navy-500 hover:bg-navy-100">
                  <Paperclip className="h-5 w-5" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Capture proof of delivery" className="cursor-pointer rounded-lg p-2 text-navy-500 hover:bg-navy-100">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                </button>
                <label htmlFor="chat-input" className="sr-only">Type a message</label>
                <input
                  id="chat-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm placeholder:text-navy-400 focus:border-accent-400"
                />
                <Button onClick={send} disabled={!draft.trim()}><Send className="h-4 w-4" aria-hidden="true" />Send</Button>
              </div>
              <p className="mt-2 flex items-center gap-1 px-1 text-[11px] text-navy-400">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />End-to-end scoped to your tenant — other providers cannot see this thread.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-navy-400">Select a conversation</div>
        )}
      </div>
    </Panel>
  );
}

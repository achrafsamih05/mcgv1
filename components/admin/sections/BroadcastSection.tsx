"use client";

import { useState } from "react";
import { Bell, Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { broadcastNotification } from "@/lib/supabase/queries";
import { Button, Panel, PanelHeader } from "../ui/primitives";

const audiences = ["All Users", "Only Suppliers", "Only Importers", "Only Logistics/Drivers"];
type Channel = "Dashboard Banner" | "Email" | "SMS";

export function BroadcastSection() {
  const [audience, setAudience] = useState(audiences[0]);
  const [channel, setChannel] = useState<Channel>("Dashboard Banner");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setError(null);

    if (!SUPABASE_CONFIGURED) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      return;
    }

    setSending(true);
    const db = createClient();
    // Live bulk broadcast — inserts a global notification row that every
    // connected client's realtime bell subscription picks up instantly.
    const res = await broadcastNotification(db, {
      title: title.trim(),
      body: `${message.trim()}  ·  Audience: ${audience} · Channel: ${channel}`,
      category: "broadcast",
    });
    setSending(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    setTitle("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const channels: { id: Channel; icon: typeof Bell }[] = [
    { id: "Dashboard Banner", icon: Bell },
    { id: "Email", icon: Mail },
    { id: "SMS", icon: MessageSquare },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <Panel>
        <PanelHeader title="Compose Broadcast" description="Push announcements across the ecosystem" />
        <form onSubmit={send} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="audience" className="mb-1.5 block text-sm font-medium text-navy-800">Target Audience</label>
              <select
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              >
                {audiences.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-navy-800">Channel</span>
              <div className="flex gap-1.5">
                {channels.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChannel(id)}
                    aria-pressed={channel === id}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors duration-200 ${
                      channel === id
                        ? "border-accent-400 bg-accent-50 text-accent-700"
                        : "border-navy-200 text-navy-600 hover:bg-navy-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {id.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="b-title" className="mb-1.5 block text-sm font-medium text-navy-800">Title</label>
            <input
              id="b-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement headline"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            />
          </div>
          <div>
            <label htmlFor="b-message" className="mb-1.5 block text-sm font-medium text-navy-800">Message</label>
            <textarea
              id="b-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your broadcast content…"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            />
          </div>

          <div className="flex items-center justify-between">
            {error ? (
              <p role="alert" className="text-sm font-medium text-red-600">{error}</p>
            ) : sent ? (
              <p role="status" className="text-sm font-medium text-emerald-600">
                Broadcast sent to {audience} via {channel}.
              </p>
            ) : <span />}
            <Button type="submit" disabled={!title.trim() || !message.trim() || sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {sending ? "Sending…" : "Send Broadcast"}
            </Button>
          </div>
        </form>
      </Panel>

      {/* Live preview */}
      <Panel className="h-fit">
        <PanelHeader title="Preview" />
        <div className="p-5">
          <div className="rounded-xl border border-accent-200 bg-accent-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-600">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />{channel}
            </p>
            <p className="mt-2 font-semibold text-navy-900">{title || "Announcement headline"}</p>
            <p className="mt-1 text-sm text-navy-600">{message || "Your broadcast content appears here."}</p>
            <p className="mt-3 text-[11px] text-navy-400">To: {audience}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

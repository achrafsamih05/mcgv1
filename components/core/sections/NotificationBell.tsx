"use client";

import { useState } from "react";
import { Bell, FileText, MapPin, MessageSquare, ShieldAlert, Warehouse } from "lucide-react";
import type { NotificationKind, PlatformNotification } from "@/lib/core/types";
import { notifications as seed } from "@/lib/core/data";

const kindIcon: Record<NotificationKind, typeof Bell> = {
  Message: MessageSquare,
  Quote: FileText,
  "Transit Milestone": MapPin,
  Reservation: Warehouse,
  Administrative: ShieldAlert,
};

export function NotificationBell() {
  const [items, setItems] = useState<PlatformNotification[]>(seed);
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        className="relative cursor-pointer rounded-lg p-2 text-navy-700 hover:bg-navy-100"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-100 px-4 py-2.5">
              <p className="text-sm font-semibold text-navy-900">Notifications</p>
              <button type="button" onClick={markAll} className="cursor-pointer text-xs font-medium text-accent-600 hover:underline">Mark all read</button>
            </div>
            <ul className="max-h-80 divide-y divide-navy-100 overflow-y-auto">
              {items.map((n) => {
                const Icon = kindIcon[n.kind];
                return (
                  <li key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? "" : "bg-accent-50/40"}`}>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                      <p className="text-xs text-navy-500">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-navy-400">{n.at}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

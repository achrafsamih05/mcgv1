"use client";

/**
 * Admin Notification Center — LIVE.
 *
 * Reads from `public.notifications` (own + global) and subscribes to
 * `postgres_changes` INSERTs. A new row triggers a visual toast + a short
 * WebAudio chime, and increments the unread badge. Clicking the bell opens a
 * dropdown; opening it marks visible items read.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Loader2, X } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchNotifications, markNotificationRead } from "@/lib/supabase/queries";
import type { Notification } from "@/lib/supabase/database.types";

function playChime() {
  try {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio is best-effort; never block the UI on it.
  }
}

export function AdminNotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [toast, setToast] = useState<Notification | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    const res = await fetchNotifications(db);
    if (!res.error) setItems(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    void load();

    const channel = db
      .channel("admin:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const row = payload.new as Notification;
          setItems((prev) => [row, ...prev].slice(0, 30));
          setToast(row);
          playChime();
          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(null), 6000);
        }
      )
      .subscribe();

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      void db.removeChannel(channel);
    };
  }, [load]);

  const unread = items.filter((n) => !n.is_read).length;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const db = dbRef.current;
      if (db) {
        const toMark = items.filter((n) => !n.is_read);
        setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
        await Promise.all(toMark.map((n) => markNotificationRead(db, n.id)));
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        onClick={toggle}
        className="relative cursor-pointer rounded-lg p-2 text-navy-700 hover:bg-navy-100"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
              <p className="text-sm font-semibold text-navy-900">Notifications</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer rounded p-1 text-navy-400 hover:bg-navy-100">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-navy-400">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
                </div>
              ) : items.length === 0 ? (
                <p className="p-8 text-center text-sm text-navy-400">No notifications yet.</p>
              ) : (
                <ul className="divide-y divide-navy-100">
                  {items.map((n) => (
                    <li key={n.id} className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: n.is_read ? "#cbd5e1" : "#F97316" }} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                          {n.body && <p className="text-xs text-navy-500">{n.body}</p>}
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-navy-400">
                            {n.category} · {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-16 z-[60] w-80 rounded-xl border border-accent-500/40 bg-navy-950 p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-accent-500">{toast.title}</p>
              {toast.body && <p className="text-xs text-navy-200">{toast.body}</p>}
            </div>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="cursor-pointer rounded p-1 text-navy-400 hover:bg-white/10">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

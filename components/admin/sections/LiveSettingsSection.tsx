"use client";

/**
 * Admin — LIVE Settings & BI (commission structure).
 *
 * Binds the platform's numeric controls to `public.platform_settings`. Each
 * commission rate is editable and persisted with a keyed `.upsert()`. Seeds
 * the three canonical keys locally if the table is empty. Realtime-subscribed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Percent, Save } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchPlatformSettings, updatePlatformSetting } from "@/lib/supabase/queries";
import type { PlatformSetting } from "@/lib/supabase/database.types";
import { Button, Panel, PanelHeader } from "../ui/primitives";

const KNOWN: { key: string; label: string; hint: string }[] = [
  { key: "supplier_commission", label: "Supplier Commission", hint: "Charged on completed supplier deals" },
  { key: "transit_commission", label: "Transit Commission", hint: "Charged on logistics / freight jobs" },
  { key: "warehouse_commission", label: "Warehouse Commission", hint: "Charged on storage bookings" },
];

export function LiveSettingsSection() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchPlatformSettings(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      const map: Record<string, string> = {};
      (res.data ?? []).forEach((s: PlatformSetting) => {
        map[s.key] = String(s.value);
      });
      setValues(map);
    }
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
      .channel("admin:settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_settings" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const setVal = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const save = async (key: string) => {
    const db = dbRef.current;
    if (!db) return;
    const num = Number(values[key]);
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      setError(`"${key}" must be a percentage between 0 and 100.`);
      return;
    }
    setSavingKey(key);
    setError(null);
    const res = await updatePlatformSetting(db, key, num);
    setSavingKey(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSavedKey(key);
    setTimeout(() => setSavedKey((cur) => (cur === key ? null : cur)), 2000);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Settings & BI" description="Commission structure" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to edit live platform settings.</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="Commission Structure" description="Live platform rates — persisted to Supabase" />
      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-navy-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {KNOWN.map((k) => (
            <div key={k.key} className="rounded-xl border border-navy-800 bg-navy-950 p-5">
              <p className="text-sm font-semibold text-white">{k.label}</p>
              <p className="mt-0.5 text-xs text-navy-400">{k.hint}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={100}
                    value={values[k.key] ?? ""}
                    onChange={(e) => setVal(k.key, e.target.value)}
                    aria-label={`${k.label} percentage`}
                    className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 pr-8 text-lg font-bold text-accent-500 focus:border-accent-500"
                  />
                  <Percent className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                </div>
                <Button onClick={() => save(k.key)} disabled={savingKey === k.key} className="shrink-0">
                  {savingKey === k.key ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : savedKey === k.key ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

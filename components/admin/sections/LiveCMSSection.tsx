"use client";

/**
 * Admin — LIVE CMS Content Editor.
 *
 * Fetches editable landing-copy rows from `public.cms_content` and lets the
 * admin mutate each field with a per-row `.upsert()`. If the table is empty it
 * seeds a set of default landing keys locally so the admin can create them.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchCmsContent, upsertCmsContent } from "@/lib/supabase/queries";
import type { CmsContent } from "@/lib/supabase/database.types";
import { Button, Panel, PanelHeader } from "../ui/primitives";

const DEFAULT_KEYS: { id: string; label: string; placeholder: string }[] = [
  { id: "hero_headline", label: "Hero Headline", placeholder: "Your integrated trade & logistics platform" },
  { id: "hero_subheadline", label: "Hero Subheadline", placeholder: "Connecting China to Morocco — unified B2B trade" },
  { id: "hero_cta", label: "Hero CTA Label", placeholder: "Start Sourcing" },
  { id: "about_description", label: "About Description", placeholder: "MCG Global connects verified suppliers…" },
  { id: "footer_tagline", label: "Footer Tagline", placeholder: "Trade with confidence." },
];

export function LiveCMSSection() {
  const [rows, setRows] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchCmsContent(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      const map: Record<string, string> = {};
      (res.data ?? []).forEach((r: CmsContent) => {
        map[r.id] = r.content;
      });
      setRows(map);
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
      .channel("admin:cms")
      .on("postgres_changes", { event: "*", schema: "public", table: "cms_content" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const setField = (id: string, value: string) => setRows((prev) => ({ ...prev, [id]: value }));

  const save = async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    setSavingId(id);
    setError(null);
    const { data: auth } = await db.auth.getUser();
    const res = await upsertCmsContent(db, id, rows[id] ?? "", auth.user?.id ?? null);
    setSavingId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 2000);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="CMS Content Editor" description="Landing page copy" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to edit live landing content.</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="CMS Content Editor" description="Edit public landing-page copy — saved straight to Supabase" />
      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}
      {loading ? (
        <div className="space-y-4 p-5" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-navy-50" />
          ))}
        </div>
      ) : (
        <div className="space-y-5 p-5">
          {DEFAULT_KEYS.map((k) => (
            <div key={k.id}>
              <label htmlFor={`cms-${k.id}`} className="mb-1.5 flex items-center justify-between text-sm font-medium text-navy-800">
                {k.label}
                <span className="font-mono text-[11px] text-navy-400">{k.id}</span>
              </label>
              <div className="flex gap-2">
                <textarea
                  id={`cms-${k.id}`}
                  rows={2}
                  value={rows[k.id] ?? ""}
                  onChange={(e) => setField(k.id, e.target.value)}
                  placeholder={k.placeholder}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
                />
                <Button onClick={() => save(k.id)} disabled={savingId === k.id} className="shrink-0 self-start">
                  {savingId === k.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : savedId === k.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )}
                  {savedId === k.id ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

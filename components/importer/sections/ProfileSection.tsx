"use client";

import { useState } from "react";
import { Save, User } from "lucide-react";
import {
  IMPORT_VOLUME_TIERS,
  INDUSTRY_VERTICALS,
  PRODUCT_CATEGORIES,
  type ImporterUser,
  type ImportVolumeTier,
  type IndustryVertical,
  type ProductCategory,
} from "@/lib/importer/types";
import { can, type ImporterSession } from "@/lib/importer/rbac";
import { Button, Panel, PanelHeader } from "../ui";

export function ProfileSection({
  session,
  profile,
}: {
  session: ImporterSession;
  profile: ImporterUser;
}) {
  const editable = can(session, "profile:update") && profile.id === session.importerId;
  const [form, setForm] = useState<ImporterUser>(profile);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ImporterUser>(key: K, value: ImporterUser[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (c: ProductCategory) =>
    setForm((prev) => ({
      ...prev,
      interestCategories: prev.interestCategories.includes(c)
        ? prev.interestCategories.filter((x) => x !== c)
        : [...prev.interestCategories, c],
    }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <Panel>
        <PanelHeader title="Business Profile" description="Your importer identity" />
        <div className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent-500 text-white">
              <User className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold text-navy-900">{form.fullName}</p>
              <p className="text-sm text-navy-500">{form.companyName ?? "Individual importer"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={form.fullName} onChange={(v) => set("fullName", v)} disabled={!editable} required />
            <Field label="Corporate Entity (optional)" value={form.companyName ?? ""} onChange={(v) => set("companyName", v)} disabled={!editable} />
            <Field label="Corporate Email" type="email" value={form.email} onChange={(v) => set("email", v)} disabled={!editable} required />
            <Field label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} disabled={!editable} required />
            <Field label="Target Country" value={form.country} onChange={(v) => set("country", v)} disabled={!editable} required />
            <Field label="Base City" value={form.city} onChange={(v) => set("city", v)} disabled={!editable} required />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Sourcing Configuration" description="Helps us match you with relevant suppliers" />
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">Industry Vertical</label>
              <select
                value={form.industry}
                disabled={!editable}
                onChange={(e) => set("industry", e.target.value as IndustryVertical)}
                className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 disabled:bg-navy-50"
              >
                {INDUSTRY_VERTICALS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">Annual Import Volume</label>
              <select
                value={form.volumeTier}
                disabled={!editable}
                onChange={(e) => set("volumeTier", e.target.value as ImportVolumeTier)}
                className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 disabled:bg-navy-50"
              >
                {IMPORT_VOLUME_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-navy-800">Targeted Interest Categories</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRODUCT_CATEGORIES.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 transition-colors duration-150 hover:bg-navy-50">
                  <input
                    type="checkbox"
                    checked={form.interestCategories.includes(c)}
                    disabled={!editable}
                    onChange={() => toggleCategory(c)}
                    className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="flex items-center justify-end gap-3">
        {!editable && <span className="text-sm text-navy-400">Read-only — insufficient permissions.</span>}
        {saved && <span role="status" className="text-sm font-medium text-emerald-600">Profile saved.</span>}
        <Button type="submit" disabled={!editable}><Save className="h-4 w-4" aria-hidden="true" />Save Profile</Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-800">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 disabled:bg-navy-50"
      />
    </div>
  );
}

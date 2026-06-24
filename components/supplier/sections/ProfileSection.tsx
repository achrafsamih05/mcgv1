"use client";

import { useState } from "react";
import { Building2, FileText, ImageIcon, Save } from "lucide-react";
import {
  EXPORT_MARKETS,
  type BusinessType,
  type ExportMarket,
  type SupplierProfile,
} from "@/lib/supplier/types";
import { can, type SupplierSession } from "@/lib/supplier/rbac";
import { Button, Panel, PanelHeader, VerificationBadge } from "../ui";

export function ProfileSection({
  session,
  profile,
}: {
  session: SupplierSession;
  profile: SupplierProfile;
}) {
  // The profile IS the tenant (keyed by `id`), so verify it matches the session.
  const editable = can(session, "profile:update") && profile.id === session.supplierId;
  const [form, setForm] = useState<SupplierProfile>(profile);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SupplierProfile>(key: K, value: SupplierProfile[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleMarket = (m: ExportMarket) =>
    setForm((prev) => ({
      ...prev,
      targetMarkets: prev.targetMarkets.includes(m)
        ? prev.targetMarkets.filter((x) => x !== m)
        : [...prev.targetMarkets, m],
    }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Company identity */}
      <Panel>
        <PanelHeader
          title="Company Identity"
          description="Your public storefront details"
          action={<VerificationBadge state={form.verification} />}
        />
        <div className="p-5">
          {/* Cover + logo */}
          <div className="relative mb-6 rounded-xl border border-navy-100 bg-gradient-to-br from-navy-800 to-navy-950 p-1">
            <div className="flex h-32 items-center justify-center rounded-lg text-white/30">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
              <span className="ml-2 text-sm">Cover image</span>
            </div>
            <div className="absolute -bottom-5 left-5 flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-accent-500 text-white">
              <Building2 className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
            <Field label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} disabled={!editable} required />
            <Field label="Business Email" type="email" value={form.businessEmail} onChange={(v) => set("businessEmail", v)} disabled={!editable} required />
            <Field label="Country" value={form.country} onChange={(v) => set("country", v)} disabled={!editable} required />
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} disabled={!editable} required />
            <Field label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} disabled={!editable} required />
            <Field label="Corporate Website (optional)" value={form.website ?? ""} onChange={(v) => set("website", v)} disabled={!editable} />
          </div>
          <Field className="mt-4" label="Full Address" value={form.address} onChange={(v) => set("address", v)} disabled={!editable} required />
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Operational Description</label>
            <textarea
              rows={4}
              value={form.description}
              disabled={!editable}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 disabled:bg-navy-50"
            />
          </div>
        </div>
      </Panel>

      {/* Business operations */}
      <Panel>
        <PanelHeader title="Business Operations Profile" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-800">Business Type</label>
            <select
              value={form.businessType}
              disabled={!editable}
              onChange={(e) => set("businessType", e.target.value as BusinessType)}
              className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 disabled:bg-navy-50"
            >
              <option value="Manufacturer">Manufacturer</option>
              <option value="Trading Company">Trading Company</option>
            </select>
          </div>
          <Field label="Year Established" type="number" value={String(form.yearEstablished)} onChange={(v) => set("yearEstablished", Number(v))} disabled={!editable} />
          <Field label="Total Employees" type="number" value={String(form.totalEmployees)} onChange={(v) => set("totalEmployees", Number(v))} disabled={!editable} />
        </div>
        <div className="px-5 pb-5">
          <label className="mb-2 block text-sm font-medium text-navy-800">Target Export Markets</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EXPORT_MARKETS.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 transition-colors duration-150 hover:bg-navy-50">
                <input
                  type="checkbox"
                  checked={form.targetMarkets.includes(m)}
                  disabled={!editable}
                  onChange={() => toggleMarket(m)}
                  className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400"
                />
                {m}
              </label>
            ))}
          </div>
        </div>
      </Panel>

      {/* Credentials vault */}
      <Panel>
        <PanelHeader title="Credentials Vault" description="Trade certificates and export licenses" />
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {form.credentials.map((c) => (
            <div key={c.id} className="rounded-lg border border-navy-100 bg-navy-50/50 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-2 truncate text-sm font-semibold text-navy-900">{c.name}</p>
              <p className="text-xs text-navy-500">{c.type}</p>
              <p className="mt-1 text-xs text-navy-400">Issued {c.issuedAt}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex items-center justify-end gap-3">
        {!editable && <span className="text-sm text-navy-400">Read-only — insufficient permissions.</span>}
        {saved && <span role="status" className="text-sm font-medium text-emerald-600">Profile saved.</span>}
        <Button type="submit" disabled={!editable}>
          <Save className="h-4 w-4" aria-hidden="true" />Save Profile
        </Button>
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
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
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

"use client";

import { useState } from "react";
import { Building2, FileText, ImageIcon, Save, User } from "lucide-react";
import type { Availability, LogisticsProvider } from "@/lib/logistics/types";
import { can, type ProviderSession } from "@/lib/logistics/rbac";
import { AvailabilityBadge, Button, Panel, PanelHeader, VerificationBadge } from "../ui";

const AVAILABILITY_OPTIONS: Availability[] = ["Available Now", "Busy", "Out of Service"];

export function ProfileSection({
  session,
  profile,
}: {
  session: ProviderSession;
  profile: LogisticsProvider;
}) {
  const editable = can(session, "profile:update") && profile.id === session.providerId;
  const [form, setForm] = useState<LogisticsProvider>(profile);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof LogisticsProvider>(key: K, value: LogisticsProvider[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isCompany = form.kind === "Transport Company";

  return (
    <form onSubmit={save} className="space-y-5">
      <Panel>
        <PanelHeader
          title={isCompany ? "Company Profile" : "Driver Profile"}
          description="Your public logistics gateway"
          action={<VerificationBadge state={form.verification} kind={form.kind} />}
        />
        <div className="p-5">
          <div className="relative mb-6 rounded-xl border border-navy-100 bg-gradient-to-br from-navy-800 to-navy-950 p-1">
            <div className="flex h-32 items-center justify-center rounded-lg text-white/30">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
              <span className="ml-2 text-sm">{isCompany ? "Cover hero image" : "Profile banner"}</span>
            </div>
            <div className="absolute -bottom-5 left-5 flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-accent-500 text-white">
              {isCompany ? <Building2 className="h-7 w-7" aria-hidden="true" /> : <User className="h-7 w-7" aria-hidden="true" />}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
            <Field label={isCompany ? "Company Name" : "Full Name"} value={form.displayName} onChange={(v) => set("displayName", v)} disabled={!editable} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} disabled={!editable} required />
            <Field label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} disabled={!editable} required />
            <Field label="Country" value={form.country} onChange={(v) => set("country", v)} disabled={!editable} required />
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} disabled={!editable} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">Live Availability</label>
              <select
                value={form.availability}
                disabled={!editable}
                onChange={(e) => set("availability", e.target.value as Availability)}
                className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400 disabled:bg-navy-50"
              >
                {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
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
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-navy-600">Current status:</span>
            <AvailabilityBadge status={form.availability} />
          </div>
        </div>
      </Panel>

      {/* KYC compliance vault */}
      <Panel>
        <PanelHeader
          title="KYC Compliance Vault"
          description={isCompany ? "Commercial registry & transport license" : "Driving license & national ID"}
        />
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {form.documents.length === 0 && (
            <p className="col-span-full text-sm text-navy-400">No documents uploaded yet.</p>
          )}
          {form.documents.map((d) => (
            <div key={d.id} className="rounded-lg border border-navy-100 bg-navy-50/50 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-2 truncate text-sm font-semibold text-navy-900">{d.label}</p>
              <p className="text-xs text-navy-500">{d.type}</p>
              <p className="mt-1 text-xs text-navy-400">Uploaded {d.uploadedAt}</p>
            </div>
          ))}
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

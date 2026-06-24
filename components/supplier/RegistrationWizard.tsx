"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, ImageIcon, Ship } from "lucide-react";
import {
  EXPORT_MARKETS,
  type BusinessType,
  type ExportMarket,
} from "@/lib/supplier/types";
import { Button } from "./ui";

type Step = 0 | 1 | 2;

type WizardState = {
  // Identity
  companyName: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  businessEmail: string;
  website: string;
  // Operations
  businessType: BusinessType;
  yearEstablished: string;
  totalEmployees: string;
  targetMarkets: ExportMarket[];
};

const initial: WizardState = {
  companyName: "",
  country: "",
  city: "",
  address: "",
  phone: "",
  businessEmail: "",
  website: "",
  businessType: "Manufacturer",
  yearEstablished: "",
  totalEmployees: "",
  targetMarkets: [],
};

const steps = ["Company Identity", "Business Operations", "Review & Submit"];

export function RegistrationWizard() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<WizardState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const toggleMarket = (m: ExportMarket) =>
    setData((prev) => ({
      ...prev,
      targetMarkets: prev.targetMarkets.includes(m)
        ? prev.targetMarkets.filter((x) => x !== m)
        : [...prev.targetMarkets, m],
    }));

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.companyName.trim()) e.companyName = "Required";
      if (!data.country.trim()) e.country = "Required";
      if (!data.city.trim()) e.city = "Required";
      if (!data.address.trim()) e.address = "Required";
      if (!data.phone.trim()) e.phone = "Required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.businessEmail)) e.businessEmail = "Valid email required";
    }
    if (s === 1) {
      if (!data.yearEstablished || Number(data.yearEstablished) < 1900) e.yearEstablished = "Enter a valid year";
      if (!data.totalEmployees || Number(data.totalEmployees) <= 0) e.totalEmployees = "Required";
      if (data.targetMarkets.length === 0) e.targetMarkets = "Select at least one market";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(2, s + 1) as Step);
  };
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const submit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Application Submitted</h2>
        <p className="mt-2 text-sm text-navy-600">
          Thanks, {data.companyName}. Your supplier application is now <span className="font-semibold text-amber-600">Pending</span> admin verification.
          You&apos;ll be notified once the Super Admin reviews your documents.
        </p>
        <a
          href="/supplier"
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600"
        >
          Go to Seller Console
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <Ship className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-bold text-navy-900">Supplier Registration</p>
          <p className="text-sm text-navy-500">Join MCG Global as a verified supplier</p>
        </div>
      </div>

      {/* Stepper */}
      <ol className="mb-6 flex items-center">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i < step ? "bg-emerald-500 text-white" : i === step ? "bg-accent-500 text-white" : "bg-navy-100 text-navy-400"
              }`}>
                {i < step ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-navy-900" : "text-navy-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className={`mx-3 h-0.5 flex-1 ${i < step ? "bg-emerald-500" : "bg-navy-100"}`} />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-navy-200 bg-navy-50 text-navy-400">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-navy-200 bg-navy-50 text-sm text-navy-400">
                <ImageIcon className="mr-2 h-5 w-5" aria-hidden="true" />Cover image (optional)
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <WField label="Company Name" value={data.companyName} error={errors.companyName} onChange={(v) => set("companyName", v)} required />
              <WField label="Business Email" type="email" value={data.businessEmail} error={errors.businessEmail} onChange={(v) => set("businessEmail", v)} required />
              <WField label="Country" value={data.country} error={errors.country} onChange={(v) => set("country", v)} required />
              <WField label="City" value={data.city} error={errors.city} onChange={(v) => set("city", v)} required />
              <WField label="Phone Number" value={data.phone} error={errors.phone} onChange={(v) => set("phone", v)} required />
              <WField label="Corporate Website (optional)" value={data.website} onChange={(v) => set("website", v)} />
            </div>
            <WField label="Full Address" value={data.address} error={errors.address} onChange={(v) => set("address", v)} required />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800">Business Type <span className="text-accent-500">*</span></label>
                <select
                  value={data.businessType}
                  onChange={(e) => set("businessType", e.target.value as BusinessType)}
                  className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
                >
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Trading Company">Trading Company</option>
                </select>
              </div>
              <WField label="Year Established" type="number" value={data.yearEstablished} error={errors.yearEstablished} onChange={(v) => set("yearEstablished", v)} required />
              <WField label="Total Employees" type="number" value={data.totalEmployees} error={errors.totalEmployees} onChange={(v) => set("totalEmployees", v)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-800">Target Export Markets <span className="text-accent-500">*</span></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EXPORT_MARKETS.map((m) => (
                  <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 transition-colors duration-150 hover:bg-navy-50">
                    <input type="checkbox" checked={data.targetMarkets.includes(m)} onChange={() => toggleMarket(m)} className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
                    {m}
                  </label>
                ))}
              </div>
              {errors.targetMarkets && <p className="mt-1 text-xs font-medium text-red-600">{errors.targetMarkets}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-navy-700">Review Your Application</h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Review label="Company" value={data.companyName} />
              <Review label="Email" value={data.businessEmail} />
              <Review label="Location" value={`${data.city}, ${data.country}`} />
              <Review label="Phone" value={data.phone} />
              <Review label="Business Type" value={data.businessType} />
              <Review label="Established" value={data.yearEstablished} />
              <Review label="Employees" value={data.totalEmployees} />
              <Review label="Markets" value={data.targetMarkets.join(", ") || "—"} />
            </dl>
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              On submit, your account enters the <strong>Pending</strong> verification funnel. The Verified Supplier badge mounts only after Super Admin approval.
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between border-t border-navy-100 pt-5">
          <Button variant="secondary" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back
          </Button>
          {step < 2 ? (
            <Button onClick={next}>
              Continue<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="success" onClick={submit}>
              <Check className="h-4 w-4" aria-hidden="true" />Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WField({
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
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
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-accent-400 ${error ? "border-red-300" : "border-navy-200"}`}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/50 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="text-sm font-semibold text-navy-900">{value || "—"}</dd>
    </div>
  );
}

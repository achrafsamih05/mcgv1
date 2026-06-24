"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Ship } from "lucide-react";
import {
  IMPORT_VOLUME_TIERS,
  INDUSTRY_VERTICALS,
  PRODUCT_CATEGORIES,
  type ImportVolumeTier,
  type IndustryVertical,
  type ProductCategory,
} from "@/lib/importer/types";
import { Button } from "./ui";

type Step = 0 | 1;
const steps = ["Account Details", "Sourcing Profile"];

type WizardState = {
  fullName: string;
  companyName: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  password: string;
  industry: IndustryVertical;
  volumeTier: ImportVolumeTier;
  interests: ProductCategory[];
};

const initial: WizardState = {
  fullName: "",
  companyName: "",
  country: "",
  city: "",
  phone: "",
  email: "",
  password: "",
  industry: "Automotive",
  volumeTier: IMPORT_VOLUME_TIERS[0],
  interests: [],
};

export function RegistrationWizard() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<WizardState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (c: ProductCategory) =>
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(c)
        ? prev.interests.filter((x) => x !== c)
        : [...prev.interests, c],
    }));

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.fullName.trim()) e.fullName = "Required";
      if (!data.country.trim()) e.country = "Required";
      if (!data.city.trim()) e.city = "Required";
      if (!data.phone.trim()) e.phone = "Required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) e.email = "Valid email required";
      if (data.password.length < 8) e.password = "Min 8 characters";
    }
    if (s === 1 && data.interests.length === 0) e.interests = "Select at least one category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(step) && setStep(1);
  const back = () => setStep(0);
  const submit = () => validateStep(1) && setSubmitted(true);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Welcome aboard, {data.fullName.split(" ")[0]}!</h2>
        <p className="mt-2 text-sm text-navy-600">Your importer account is ready. Start sourcing products and suppliers from your command center.</p>
        <a href="/importer" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
          Go to Command Center
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <Ship className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-bold text-navy-900">Importer Sign-Up</p>
          <p className="text-sm text-navy-500">Source globally with MCG Global</p>
        </div>
      </div>

      <ol className="mb-6 flex items-center">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i < step ? "bg-emerald-500 text-white" : i === step ? "bg-accent-500 text-white" : "bg-navy-100 text-navy-400"
              }`}>
                {i < step ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={`text-sm font-medium ${i === step ? "text-navy-900" : "text-navy-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className={`mx-3 h-0.5 flex-1 ${i < step ? "bg-emerald-500" : "bg-navy-100"}`} />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <WField label="Full Name" value={data.fullName} error={errors.fullName} onChange={(v) => set("fullName", v)} required />
              <WField label="Corporate Entity (optional)" value={data.companyName} onChange={(v) => set("companyName", v)} />
              <WField label="Target Country" value={data.country} error={errors.country} onChange={(v) => set("country", v)} required />
              <WField label="Base City" value={data.city} error={errors.city} onChange={(v) => set("city", v)} required />
              <WField label="Phone Number" value={data.phone} error={errors.phone} onChange={(v) => set("phone", v)} required />
              <WField label="Corporate Email" type="email" value={data.email} error={errors.email} onChange={(v) => set("email", v)} required />
            </div>
            <WField label="Password" type="password" value={data.password} error={errors.password} onChange={(v) => set("password", v)} required />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800">Industry Vertical</label>
                <select value={data.industry} onChange={(e) => set("industry", e.target.value as IndustryVertical)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                  {INDUSTRY_VERTICALS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800">Annual Import Volume</label>
                <select value={data.volumeTier} onChange={(e) => set("volumeTier", e.target.value as ImportVolumeTier)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                  {IMPORT_VOLUME_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-800">Targeted Interest Categories <span className="text-accent-500">*</span></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRODUCT_CATEGORIES.map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 transition-colors duration-150 hover:bg-navy-50">
                    <input type="checkbox" checked={data.interests.includes(c)} onChange={() => toggleInterest(c)} className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
                    {c}
                  </label>
                ))}
              </div>
              {errors.interests && <p className="mt-1 text-xs font-medium text-red-600">{errors.interests}</p>}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-navy-100 pt-5">
          <Button variant="secondary" onClick={back} disabled={step === 0}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Button>
          {step < 1 ? (
            <Button onClick={next}>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          ) : (
            <Button variant="success" onClick={submit}><Check className="h-4 w-4" aria-hidden="true" />Create Account</Button>
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

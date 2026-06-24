"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, FileText, Loader2, Ship, User } from "lucide-react";
import type { OperatorKind } from "@/lib/warehouse/types";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { insertWarehouse } from "@/lib/supabase/queries";
import { Button } from "./ui";

type Step = 0 | 1 | 2;
const steps = ["Account Type", "Profile Details", "Compliance & Submit"];

type WizardState = {
  kind: OperatorKind;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
};

const initial: WizardState = {
  kind: "Individual Owner",
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
};

export function RegistrationWizard() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<WizardState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCompany = data.kind === "Storage Company";
  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.fullName.trim()) e.fullName = "Required";
      if (isCompany && !data.companyName.trim()) e.companyName = "Required for companies";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) e.email = "Valid email required";
      if (!data.phone.trim()) e.phone = "Required";
      if (!data.country.trim()) e.country = "Required";
      if (!data.city.trim()) e.city = "Required";
      if (!data.address.trim()) e.address = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(step) && setStep((s) => Math.min(2, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  /**
   * Loop A submission: insert a live `warehouses` row owned by the signed-in
   * Warehouse_Host. RLS keeps the asset invisible publicly until the host's
   * profile is APPROVED by an admin. Form values are retained on failure.
   */
  const submit = async () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    setSubmitError(null);

    if (!SUPABASE_CONFIGURED) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    const db = createClient();
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) {
      setSubmitError("You must be signed in to submit a warehouse listing.");
      setSubmitting(false);
      return;
    }

    const res = await insertWarehouse(db, {
      host_id: auth.user.id,
      title: isCompany ? data.companyName.trim() : `${data.fullName.trim()} — ${data.city.trim()}`,
      city: data.city.trim(),
      total_area_m2: null,
      available_area_m2: null,
      price_per_m2_monthly: null,
    });

    setSubmitting(false);
    if (res.error) {
      setSubmitError(res.error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Application Submitted</h2>
        <p className="mt-2 text-sm text-navy-600">
          Thanks, {data.fullName}. Your {isCompany ? "storage company" : "warehouse owner"} application is now{" "}
          <span className="font-semibold text-amber-600">Pending</span> admin verification.
        </p>
        <a href="/warehouse" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
          Go to Operator Console
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <Ship className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-bold text-navy-900">Warehouse Registration</p>
          <p className="text-sm text-navy-500">List your storage facilities on MCG Global</p>
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
              <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-navy-900" : "text-navy-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className={`mx-3 h-0.5 flex-1 ${i < step ? "bg-emerald-500" : "bg-navy-100"}`} />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(["Individual Owner", "Storage Company"] as OperatorKind[]).map((k) => {
              const selected = data.kind === k;
              const Icon = k === "Storage Company" ? Building2 : User;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("kind", k)}
                  aria-pressed={selected}
                  className={`flex cursor-pointer flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-colors duration-200 ${
                    selected ? "border-accent-500 bg-accent-50" : "border-navy-200 hover:bg-navy-50"
                  }`}
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected ? "bg-accent-500 text-white" : "bg-navy-100 text-navy-600"}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-base font-semibold text-navy-900">{k}</span>
                  <span className="text-sm text-navy-500">
                    {k === "Storage Company"
                      ? "Operate multiple facilities under one company tenant with staff access."
                      : "Individual owner listing your own warehouse space."}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <WField label="Full Name" value={data.fullName} error={errors.fullName} onChange={(v) => set("fullName", v)} required />
              <WField label={`Company Name${isCompany ? "" : " (optional)"}`} value={data.companyName} error={errors.companyName} onChange={(v) => set("companyName", v)} required={isCompany} />
              <WField label="Email" type="email" value={data.email} error={errors.email} onChange={(v) => set("email", v)} required />
              <WField label="Phone Number" value={data.phone} error={errors.phone} onChange={(v) => set("phone", v)} required />
              <WField label="Country" value={data.country} error={errors.country} onChange={(v) => set("country", v)} required />
              <WField label="City" value={data.city} error={errors.city} onChange={(v) => set("city", v)} required />
            </div>
            <WField label="Full Address" value={data.address} error={errors.address} onChange={(v) => set("address", v)} required />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-navy-700">KYC Document Upload</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(isCompany
                ? ["Commercial Registry (السجل التجاري)", "Business Activity License", "Proof of Property / Lease Agreement"]
                : ["National ID Card"]
              ).map((doc) => (
                <div key={doc} className="flex items-center gap-3 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 p-4">
                  <FileText className="h-5 w-5 text-navy-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">{doc}</p>
                    <p className="text-xs text-navy-400">Click to upload (PDF/JPG)</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              On submit, your account enters the <strong>Pending</strong> verification funnel. The Verified Warehouse badge mounts after admin review.
            </div>
            {submitError && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {submitError}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-navy-100 pt-5">
          <Button variant="secondary" onClick={back} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back
          </Button>
          {step < 2 ? (
            <Button onClick={next}>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          ) : (
            <Button variant="success" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
              {submitting ? "Submitting…" : "Submit Application"}
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

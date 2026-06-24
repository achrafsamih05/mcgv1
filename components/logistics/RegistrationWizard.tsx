"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, Ship, Truck, User } from "lucide-react";
import type { ProviderKind } from "@/lib/logistics/types";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { upsertDriverMetadata } from "@/lib/supabase/queries";
import { Button } from "./ui";

/**
 * Carrier / Driver onboarding wizard.
 *
 * Captures Full Name / Fleet Name, Phone, and License details, then runs a
 * live UPSERT against `public.profiles` (role = DRIVER, status = PENDING) plus
 * the 1:1 drivers_metadata row. On success it routes to /logistics, where the
 * dashboard shows an "Awaiting Admin Verification" banner while pending.
 *
 * Brand tokens: deep dark (#0F172A) framing + accent orange (#F97316) actions.
 */
type Step = 0 | 1;
const steps = ["Carrier Type", "Profile & License"];

type WizardState = {
  kind: ProviderKind;
  displayName: string;
  phone: string;
  licenseNumber: string;
};

const initial: WizardState = {
  kind: "Independent Driver",
  displayName: "",
  phone: "",
  licenseNumber: "",
};

export function RegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<WizardState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState<boolean>(SUPABASE_CONFIGURED);

  const isCompany = data.kind === "Transport Company";

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  // Prefill from an existing profile + driver metadata row.
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const db = createClient();
    let active = true;

    (async () => {
      const { data: auth } = await db.auth.getUser();
      if (!auth.user) {
        if (active) setHydrating(false);
        return;
      }
      const [{ data: profile }, { data: meta }] = await Promise.all([
        db.from("profiles").select("full_name, company_name, phone_number").eq("id", auth.user.id).maybeSingle(),
        db.from("drivers_metadata").select("license_number").eq("id", auth.user.id).maybeSingle(),
      ]);

      if (!active) return;
      if (profile) {
        setData((prev) => ({
          kind: profile.company_name ? "Transport Company" : prev.kind,
          displayName: profile.company_name || profile.full_name || "",
          phone: profile.phone_number ?? "",
          licenseNumber: meta?.license_number ?? "",
        }));
      }
      setHydrating(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.displayName.trim()) e.displayName = "Required";
      if (!data.phone.trim()) e.phone = "Required";
      if (!data.licenseNumber.trim()) e.licenseNumber = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(step) && setStep(1);
  const back = () => setStep(0);

  const submit = async () => {
    if (!validateStep(1)) return;
    setSubmitError(null);

    if (!SUPABASE_CONFIGURED) {
      router.push("/logistics");
      return;
    }

    setSubmitting(true);
    const db = createClient();
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) {
      setSubmitError("You must be signed in to complete onboarding.");
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await db.from("profiles").upsert(
      {
        id: auth.user.id,
        full_name: data.displayName.trim(),
        company_name: isCompany ? data.displayName.trim() : null,
        phone_number: data.phone.trim(),
        role: "DRIVER",
        status: "PENDING",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setSubmitError(profileError.message);
      setSubmitting(false);
      return;
    }

    // Provision the 1:1 driver metadata row with the captured license.
    const meta = await upsertDriverMetadata(db, {
      id: auth.user.id,
      license_number: data.licenseNumber.trim(),
      vehicle: "TRUCK",
      max_weight_capacity_kg: null,
    });
    if (meta.error) {
      setSubmitError(meta.error);
      setSubmitting(false);
      return;
    }

    router.push("/logistics");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <Ship className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-bold text-navy-900">Carrier Onboarding</p>
          <p className="text-sm text-navy-500">Join MCG Global as a verified transport provider</p>
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
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-navy-950 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-navy-100">
            You can accept cargo assignments only after a Super Admin verifies your account.
          </p>
        </div>

        {hydrating ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-navy-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading your profile…
          </div>
        ) : (
          <>
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(["Independent Driver", "Transport Company"] as ProviderKind[]).map((k) => {
                  const selected = data.kind === k;
                  const Icon = k === "Transport Company" ? Building2 : User;
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
                        {k === "Transport Company"
                          ? "Manage a fleet of vehicles and multiple drivers under one company tenant."
                          : "Owner-operator registering as an individual driver with your own vehicle."}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <WField label={isCompany ? "Company / Fleet Name" : "Full Name"} value={data.displayName} error={errors.displayName} onChange={(v) => set("displayName", v)} required />
                  <WField label="Phone Number" type="tel" value={data.phone} error={errors.phone} onChange={(v) => set("phone", v)} required />
                </div>
                <WField
                  label={isCompany ? "Transport License Number" : "Driver's License Number"}
                  value={data.licenseNumber}
                  error={errors.licenseNumber}
                  onChange={(v) => set("licenseNumber", v)}
                  required
                />
              </div>
            )}

            {submitError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-navy-100 pt-5">
              <Button variant="secondary" onClick={back} disabled={step === 0 || submitting}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back
              </Button>
              {step < 1 ? (
                <Button onClick={next}>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
              ) : (
                <Button variant="success" onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  {submitting ? "Submitting…" : "Submit for Verification"}
                </Button>
              )}
            </div>
          </>
        )}
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

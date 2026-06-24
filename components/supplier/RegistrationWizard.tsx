"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Factory, Loader2, Ship } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { Button } from "./ui";

/**
 * Supplier (Manufacturer) B2B onboarding wizard.
 *
 * Captures Full Name, Company/Factory Name, Phone Number and Primary Product
 * Categories, then runs a live UPSERT against `public.profiles` setting
 * role = SUPPLIER and status = PENDING (admin must approve before the
 * storefront becomes publicly visible). On success it routes to /supplier.
 *
 * Brand tokens: deep dark (#0F172A) framing + accent orange (#F97316) actions.
 */
const CATEGORY_OPTIONS = [
  "Electronics",
  "Textiles & Apparel",
  "Automotive & Parts",
  "Heavy Machinery",
  "Industrial Equipment",
  "Furniture & Décor",
  "Construction Materials",
  "Consumer Goods",
] as const;

type Step = 0 | 1;
const steps = ["Manufacturer Identity", "Product Categories"];

type WizardState = {
  fullName: string;
  companyName: string;
  phone: string;
  categories: string[];
};

const initial: WizardState = {
  fullName: "",
  companyName: "",
  phone: "",
  categories: [],
};

export function RegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<WizardState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState<boolean>(SUPABASE_CONFIGURED);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (c: string) =>
    setData((prev) => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter((x) => x !== c)
        : [...prev.categories, c],
    }));

  // Prefill from any existing profile row.
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
      const { data: profile } = await db
        .from("profiles")
        .select("full_name, company_name, phone_number, supplier_category")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (!active) return;
      if (profile) {
        setData({
          fullName: profile.full_name ?? "",
          companyName: profile.company_name ?? "",
          phone: profile.phone_number ?? "",
          categories: profile.supplier_category
            ? profile.supplier_category.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        });
      }
      setHydrating(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.fullName.trim()) e.fullName = "Required";
      if (!data.companyName.trim()) e.companyName = "Required";
      if (!data.phone.trim()) e.phone = "Required";
    }
    if (s === 1 && data.categories.length === 0) e.categories = "Select at least one category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(step) && setStep(1);
  const back = () => setStep(0);

  const submit = async () => {
    if (!validateStep(1)) return;
    setSubmitError(null);

    if (!SUPABASE_CONFIGURED) {
      router.push("/supplier");
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

    const { error } = await db.from("profiles").upsert(
      {
        id: auth.user.id,
        full_name: data.fullName.trim(),
        company_name: data.companyName.trim(),
        phone_number: data.phone.trim(),
        supplier_category: data.categories.join(", "),
        role: "SUPPLIER",
        status: "PENDING",
      },
      { onConflict: "id" }
    );

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    router.push("/supplier");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
          <Ship className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-bold text-navy-900">Manufacturer Onboarding</p>
          <p className="text-sm text-navy-500">Join MCG Global as a verified supplier</p>
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
            <Factory className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-navy-100">
            Your storefront stays private until a Super Admin approves your account.
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <WField label="Full Name" value={data.fullName} error={errors.fullName} onChange={(v) => set("fullName", v)} required />
                  <WField label="Company / Factory Name" value={data.companyName} error={errors.companyName} onChange={(v) => set("companyName", v)} required />
                  <WField label="Phone Number" type="tel" value={data.phone} error={errors.phone} onChange={(v) => set("phone", v)} required />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-800">
                    Primary Product Categories <span className="text-accent-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CATEGORY_OPTIONS.map((c) => {
                      const selected = data.categories.includes(c);
                      return (
                        <label
                          key={c}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-colors duration-150 ${
                            selected ? "border-accent-500 bg-accent-50 text-navy-900" : "border-navy-200 text-navy-700 hover:bg-navy-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleCategory(c)}
                            className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400"
                          />
                          {c}
                        </label>
                      );
                    })}
                  </div>
                  {errors.categories && <p className="mt-1 text-xs font-medium text-red-600">{errors.categories}</p>}
                </div>
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

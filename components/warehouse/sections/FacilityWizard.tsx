"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImageIcon } from "lucide-react";
import {
  DEFAULT_ANCILLARY_SERVICES,
  WAREHOUSE_CATEGORIES,
  type AncillaryService,
  type WarehouseCategory,
  type WarehouseFacility,
} from "@/lib/warehouse/types";
import { Button } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

type Step = 0 | 1 | 2;
const steps = ["Core & Location", "Structural Specs", "Pricing & Services"];

type FormState = {
  name: string;
  category: WarehouseCategory;
  country: string;
  city: string;
  address: string;
  coordinates: string;
  videoUrl: string;
  totalAreaSqm: string;
  availableSqm: string;
  floors: string;
  clearanceHeightM: string;
  floorType: string;
  daily: string;
  weekly: string;
  monthly: string;
  annual: string;
};

const empty: FormState = {
  name: "", category: "General", country: "", city: "", address: "", coordinates: "",
  videoUrl: "", totalAreaSqm: "", availableSqm: "", floors: "1", clearanceHeightM: "",
  floorType: "", daily: "", weekly: "", monthly: "", annual: "",
};

export function FacilityWizard({
  open,
  onClose,
  operatorId,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  operatorId: string;
  onCreate: (f: WarehouseFacility) => void;
}) {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>(empty);
  const [services, setServices] = useState<AncillaryService[]>(DEFAULT_ANCILLARY_SERVICES);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setStep(0);
    setForm(empty);
    setServices(DEFAULT_ANCILLARY_SERVICES);
    setErrors({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const validateStep = (s: Step): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Required";
      if (!form.country.trim()) e.country = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.address.trim()) e.address = "Required";
    }
    if (s === 1) {
      if (!form.totalAreaSqm || Number(form.totalAreaSqm) <= 0) e.totalAreaSqm = "Required";
      if (form.availableSqm === "" || Number(form.availableSqm) < 0) e.availableSqm = "Required";
      if (Number(form.availableSqm) > Number(form.totalAreaSqm)) e.availableSqm = "Cannot exceed total";
      if (!form.clearanceHeightM || Number(form.clearanceHeightM) <= 0) e.clearanceHeightM = "Required";
      if (!form.floorType.trim()) e.floorType = "Required";
    }
    if (s === 2) {
      if (!form.monthly || Number(form.monthly) <= 0) e.monthly = "Monthly rate required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(step) && setStep((s) => Math.min(2, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const toggleService = (key: AncillaryService["key"]) =>
    setServices((prev) => prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
  const setServicePrice = (key: AncillaryService["key"], price: number) =>
    setServices((prev) => prev.map((s) => (s.key === key ? { ...s, price } : s)));

  const submit = () => {
    if (!validateStep(2)) return;
    const facility: WarehouseFacility = {
      id: `WH-${Math.floor(100 + Math.random() * 900)}`,
      operatorId,
      name: form.name.trim(),
      category: form.category,
      country: form.country.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      coordinates: form.coordinates.trim() || "0, 0",
      imageCount: 0,
      videoUrl: form.videoUrl.trim() || undefined,
      totalAreaSqm: Number(form.totalAreaSqm),
      availableSqm: Number(form.availableSqm),
      floors: Number(form.floors) || 1,
      clearanceHeightM: Number(form.clearanceHeightM),
      floorType: form.floorType.trim(),
      pricing: {
        daily: Number(form.daily) || 0,
        weekly: Number(form.weekly) || 0,
        monthly: Number(form.monthly),
        annual: Number(form.annual) || 0,
      },
      services,
      availability: "Available for Booking",
      verification: "Pending",
    };
    onCreate(facility);
    close();
  };

  return (
    <Modal open={open} onClose={close} title="List a Warehouse" size="lg">
      {/* Stepper */}
      <ol className="mb-5 flex items-center">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? "bg-emerald-500 text-white" : i === step ? "bg-accent-500 text-white" : "bg-navy-100 text-navy-400"
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-navy-900" : "text-navy-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-emerald-500" : "bg-navy-100"}`} />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <WField label="Warehouse Name" value={form.name} error={errors.name} onChange={(v) => set("name", v)} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                {WAREHOUSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <WField label="Country" value={form.country} error={errors.country} onChange={(v) => set("country", v)} required />
            <WField label="City" value={form.city} error={errors.city} onChange={(v) => set("city", v)} required />
          </div>
          <WField label="Full Street Address" value={form.address} error={errors.address} onChange={(v) => set("address", v)} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <WField label="Map Coordinates (lat, lng)" value={form.coordinates} onChange={(v) => set("coordinates", v)} placeholder="33.57, -7.58" />
            <WField label="Video URL (optional)" value={form.videoUrl} onChange={(v) => set("videoUrl", v)} placeholder="https://…" />
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 py-5 text-sm text-navy-500">
            <ImageIcon className="h-5 w-5" aria-hidden="true" />Upload image gallery
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <WField label="Total Surface Area (sqm)" type="number" value={form.totalAreaSqm} error={errors.totalAreaSqm} onChange={(v) => set("totalAreaSqm", v)} required />
          <WField label="Currently Available (sqm)" type="number" value={form.availableSqm} error={errors.availableSqm} onChange={(v) => set("availableSqm", v)} required />
          <WField label="Number of Floors" type="number" value={form.floors} onChange={(v) => set("floors", v)} />
          <WField label="Clearance Height (m)" type="number" value={form.clearanceHeightM} error={errors.clearanceHeightM} onChange={(v) => set("clearanceHeightM", v)} required />
          <WField label="Floor Type" value={form.floorType} error={errors.floorType} onChange={(v) => set("floorType", v)} placeholder="Reinforced concrete…" required />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Multi-Tier Pricing ($/sqm)</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <WField label="Daily" type="number" value={form.daily} onChange={(v) => set("daily", v)} />
              <WField label="Weekly" type="number" value={form.weekly} onChange={(v) => set("weekly", v)} />
              <WField label="Monthly" type="number" value={form.monthly} error={errors.monthly} onChange={(v) => set("monthly", v)} required />
              <WField label="Annual" type="number" value={form.annual} onChange={(v) => set("annual", v)} />
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Ancillary Services</h3>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.key} className="flex items-center gap-3 rounded-lg border border-navy-100 px-3 py-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-navy-800">
                    <input type="checkbox" checked={s.enabled} onChange={() => toggleService(s.key)} className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
                    {s.label}
                  </label>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-navy-400">$</span>
                    <input
                      type="number"
                      value={s.price || ""}
                      disabled={!s.enabled}
                      onChange={(e) => setServicePrice(s.key, Number(e.target.value))}
                      placeholder="0"
                      className="w-24 rounded-lg border border-navy-200 px-2 py-1.5 text-sm focus:border-accent-400 disabled:bg-navy-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-navy-100 pt-4">
        <Button variant="secondary" onClick={back} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back
        </Button>
        {step < 2 ? (
          <Button onClick={next}>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
        ) : (
          <Button variant="success" onClick={submit}><Check className="h-4 w-4" aria-hidden="true" />Create Listing</Button>
        )}
      </div>
    </Modal>
  );
}

function WField({
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-800">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-accent-400 ${error ? "border-red-300" : "border-navy-200"}`}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

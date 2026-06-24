"use client";

import { useState } from "react";
import { Bike, Car, ImageIcon, Plus, Trash2, Truck, type LucideIcon } from "lucide-react";
import {
  VEHICLE_CLASSES,
  type VehicleAsset,
  type VehicleClass,
} from "@/lib/logistics/types";
import { can, scopeToTenant, type ProviderSession } from "@/lib/logistics/rbac";
import { AvailabilityToggleRow } from "./AvailabilityToggleRow";
import { Badge, Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

// Lucide has no dedicated "Van" glyph; Truck communicates medium delivery too.
const classIcons: Record<VehicleClass, LucideIcon> = {
  Truck,
  Van: Truck,
  Car,
  Motorcycle: Bike,
};

type FormState = {
  class: VehicleClass;
  truckType: string;
  plate: string;
  maxPayloadKg: string;
  lengthM: string;
  widthM: string;
  heightM: string;
  manufactureYear: string;
  currentCity: string;
};

const emptyForm: FormState = {
  class: "Truck",
  truckType: "",
  plate: "",
  maxPayloadKg: "",
  lengthM: "",
  widthM: "",
  heightM: "",
  manufactureYear: "",
  currentCity: "",
};

export function FleetSection({
  session,
  seedVehicles,
}: {
  session: ProviderSession;
  seedVehicles: VehicleAsset[];
}) {
  const [vehicles, setVehicles] = useState<VehicleAsset[]>(() => scopeToTenant(session, seedVehicles));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canManage = can(session, "fleet:manage");

  const set = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.plate.trim()) errs.plate = "License plate required.";
    if (!form.maxPayloadKg || Number(form.maxPayloadKg) <= 0) errs.maxPayloadKg = "Enter payload.";
    if (!form.currentCity.trim()) errs.currentCity = "City required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const v: VehicleAsset = {
      id: `VH-${Math.floor(100 + Math.random() * 900)}`,
      providerId: session.providerId,
      class: form.class,
      truckType: form.class === "Truck" ? form.truckType.trim() || undefined : undefined,
      plate: form.plate.trim(),
      maxPayloadKg: Number(form.maxPayloadKg),
      lengthM: form.lengthM ? Number(form.lengthM) : undefined,
      widthM: form.widthM ? Number(form.widthM) : undefined,
      heightM: form.heightM ? Number(form.heightM) : undefined,
      manufactureYear: form.manufactureYear ? Number(form.manufactureYear) : undefined,
      currentCity: form.currentCity.trim(),
      available: true,
      imageCount: 0,
    };
    setVehicles((prev) => [v, ...prev]);
    setOpen(false);
  };

  const toggleAvailable = (id: string, next: boolean) =>
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, available: next } : v)));

  const confirmDelete = () => {
    if (!deleteId) return;
    setVehicles((prev) => prev.filter((v) => v.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <Panel>
      <PanelHeader
        title="Vehicle Inventory"
        description={`${vehicles.length} vehicles in your fleet`}
        action={
          <Button onClick={openCreate} disabled={!canManage}>
            <Plus className="h-4 w-4" aria-hidden="true" />Add Vehicle
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => {
          const Icon = classIcons[v.class];
          return (
            <div key={v.id} className="rounded-xl border border-navy-100 p-4 transition-shadow duration-200 hover:shadow-md">
              <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-navy-100 text-navy-300">
                <ImageIcon className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                  <Icon className="h-4 w-4 text-accent-500" aria-hidden="true" />
                  {v.class}{v.truckType ? ` · ${v.truckType}` : ""}
                </span>
                <Badge tone={v.available ? "success" : "neutral"}>{v.available ? "Available" : "Busy"}</Badge>
              </div>
              <dl className="mt-3 space-y-1 text-xs text-navy-600">
                <div className="flex justify-between"><dt>Plate</dt><dd className="font-medium text-navy-900">{v.plate}</dd></div>
                <div className="flex justify-between"><dt>Max payload</dt><dd className="font-medium text-navy-900">{v.maxPayloadKg.toLocaleString()} kg</dd></div>
                {v.lengthM && <div className="flex justify-between"><dt>Dimensions</dt><dd className="font-medium text-navy-900">{v.lengthM}×{v.widthM}×{v.heightM} m</dd></div>}
                {v.manufactureYear && <div className="flex justify-between"><dt>Year</dt><dd className="font-medium text-navy-900">{v.manufactureYear}</dd></div>}
                <div className="flex justify-between"><dt>Location</dt><dd className="font-medium text-navy-900">{v.currentCity}</dd></div>
              </dl>
              <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-3">
                <AvailabilityToggleRow checked={v.available} onChange={(n) => toggleAvailable(v.id, n)} label={`Toggle availability for ${v.plate}`} />
                <Button variant="danger" size="sm" disabled={!canManage} onClick={() => setDeleteId(v.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />Remove
                </Button>
              </div>
            </div>
          );
        })}
        {vehicles.length === 0 && (
          <p className="col-span-full py-12 text-center text-navy-400">No vehicles yet. Add your first asset.</p>
        )}
      </div>

      {/* Add vehicle modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Vehicle" size="md">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-800">Vehicle Class</label>
              <select
                value={form.class}
                onChange={(e) => set("class", e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              >
                {VEHICLE_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {form.class === "Truck" && (
              <VField label="Truck Type" value={form.truckType} onChange={(v) => set("truckType", v)} placeholder="Flatbed, Box, Refrigerated…" />
            )}
            <VField label="License Plate" value={form.plate} error={errors.plate} onChange={(v) => set("plate", v)} required />
            <VField label="Max Payload (kg)" type="number" value={form.maxPayloadKg} error={errors.maxPayloadKg} onChange={(v) => set("maxPayloadKg", v)} required />
            <VField label="Current City" value={form.currentCity} error={errors.currentCity} onChange={(v) => set("currentCity", v)} required />
            <VField label="Manufacture Year" type="number" value={form.manufactureYear} onChange={(v) => set("manufactureYear", v)} />
          </div>

          {form.class === "Truck" && (
            <div className="grid grid-cols-3 gap-4">
              <VField label="Length (m)" type="number" value={form.lengthM} onChange={(v) => set("lengthM", v)} />
              <VField label="Width (m)" type="number" value={form.widthM} onChange={(v) => set("widthM", v)} />
              <VField label="Height (m)" type="number" value={form.heightM} onChange={(v) => set("heightM", v)} />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 py-5 text-sm text-navy-500">
            <ImageIcon className="h-5 w-5" aria-hidden="true" />Upload asset image
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Vehicle</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Vehicle" size="sm">
        <p className="text-sm text-navy-600">This removes the vehicle from your fleet. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}><Trash2 className="h-4 w-4" aria-hidden="true" />Remove</Button>
        </div>
      </Modal>
    </Panel>
  );
}

function VField({
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

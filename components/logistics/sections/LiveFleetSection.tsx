"use client";

/**
 * Logistics Command Center — LIVE metrics + fleet management.
 *
 * - Live operational metrics via head-only exact-count queries: Active Trips,
 *   Registered Vehicles, Completed Shipments, Pending Cargo Offers.
 * - Fleet panel: live INSERT of vehicles and live status cycling
 *   (AVAILABLE / ON_TRIP / MAINTENANCE), all scoped to auth.uid() via RLS.
 *
 * Brand tokens: dark cards (#0F172A) + accent orange (#F97316) metrics/CTAs.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, Inbox, Loader2, Plus, Route, Trash2, Truck } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import {
  countCarrierActiveTrips,
  countCarrierCompletedShipments,
  countCarrierVehicles,
  countPendingCargoOffers,
  deleteVehicle,
  fetchCarrierVehicles,
  insertVehicle,
  setVehicleStatus,
} from "@/lib/supabase/queries";
import type { Vehicle, VehicleStatus } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

type Metrics = { activeTrips: number; vehicles: number; completed: number; offers: number };

type VehicleForm = { plate: string; type: string; capacity: string };
const emptyForm: VehicleForm = { plate: "", type: "Container Truck", capacity: "" };

const STATUS_CYCLE: VehicleStatus[] = ["AVAILABLE", "ON_TRIP", "MAINTENANCE"];
const statusTone: Record<VehicleStatus, Parameters<typeof Badge>[0]["tone"]> = {
  AVAILABLE: "success",
  ON_TRIP: "accent",
  MAINTENANCE: "warning",
};
const VEHICLE_TYPES = ["Container Truck", "Flatbed Truck", "Refrigerated Truck", "Van", "Car", "Motorcycle"];

export function LiveFleetSection({ carrierId }: { carrierId: string | null }) {
  const [metrics, setMetrics] = useState<Metrics>({ activeTrips: 0, vehicles: 0, completed: 0, offers: 0 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const refresh = useCallback(async () => {
    const db = dbRef.current;
    if (!db || !carrierId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [fleet, active, count, completed, offers] = await Promise.all([
      fetchCarrierVehicles(db, carrierId),
      countCarrierActiveTrips(db, carrierId),
      countCarrierVehicles(db, carrierId),
      countCarrierCompletedShipments(db, carrierId),
      countPendingCargoOffers(db),
    ]);
    if (fleet.error) setFeedError(fleet.error);
    else {
      setFeedError(null);
      setVehicles(fleet.data ?? []);
    }
    setMetrics({
      activeTrips: active.data ?? 0,
      vehicles: count.data ?? 0,
      completed: completed.data ?? 0,
      offers: offers.data ?? 0,
    });
    setLoading(false);
  }, [carrierId]);

  useEffect(() => {
    const db = dbRef.current;
    if (!db || !carrierId) {
      setLoading(false);
      return;
    }
    void refresh();

    const channel = db
      .channel(`logistics:fleet:${carrierId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles", filter: `carrier_id=eq.${carrierId}` }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, () => void refresh())
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [carrierId, refresh]);

  const set = <K extends keyof VehicleForm>(key: K, value: VehicleForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setSubmitError(null);
    setOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof VehicleForm, string>> = {};
    if (!form.plate.trim()) e.plate = "Plate number required";
    if (!form.type.trim()) e.type = "Vehicle type required";
    const cap = Number(form.capacity);
    if (!form.capacity || cap <= 0) e.capacity = "Enter a valid capacity (kg)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    const db = dbRef.current;
    if (!db || !carrierId) {
      setSubmitError("You must be signed in to add a vehicle.");
      return;
    }

    setSubmitting(true);
    const res = await insertVehicle(db, {
      carrier_id: carrierId,
      plate_number: form.plate.trim(),
      vehicle_type: form.type.trim(),
      max_weight_capacity: Number(form.capacity),
      current_status: "AVAILABLE",
    });
    setSubmitting(false);
    if (res.error) {
      setSubmitError(res.error);
      return;
    }
    setOpen(false);
  };

  const cycleStatus = async (v: Vehicle) => {
    const db = dbRef.current;
    if (!db) return;
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(v.current_status) + 1) % STATUS_CYCLE.length];
    setBusyId(v.id);
    await setVehicleStatus(db, v.id, nextStatus);
    setBusyId(null);
  };

  const remove = async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    setBusyId(id);
    await deleteVehicle(db, id);
    setBusyId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Logistics Command Center" description="Live fleet & metrics" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase to load your live fleet and operational metrics.
        </div>
      </Panel>
    );
  }

  if (!carrierId) {
    return (
      <Panel>
        <PanelHeader title="Logistics Command Center" description="Live fleet & metrics" />
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-navy-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Resolving your session…
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Active Trips" value={metrics.activeTrips} icon={<Route className="h-5 w-5" />} accent loading={loading} />
        <MetricCard label="Registered Vehicles" value={metrics.vehicles} icon={<Truck className="h-5 w-5" />} loading={loading} />
        <MetricCard label="Completed Shipments" value={metrics.completed} icon={<Boxes className="h-5 w-5" />} loading={loading} />
        <MetricCard label="Pending Cargo Offers" value={metrics.offers} icon={<Inbox className="h-5 w-5" />} loading={loading} />
      </div>

      {/* Fleet management */}
      <Panel>
        <PanelHeader
          title="Fleet Manager"
          description={`${vehicles.length} ${vehicles.length === 1 ? "vehicle" : "vehicles"}`}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />Add Vehicle
            </Button>
          }
        />
        {feedError && (
          <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{feedError}</p>
        )}
        {loading && vehicles.length === 0 ? (
          <div className="flex items-center justify-center gap-2 p-12 text-navy-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading fleet…
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
            <Truck className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm font-medium">No vehicles yet. Register your first truck.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                  <th className="px-5 py-3 font-semibold">Plate</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Max Capacity</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-navy-50/60">
                    <td className="px-5 py-3 font-semibold text-navy-900">{v.plate_number ?? "—"}</td>
                    <td className="px-5 py-3 text-navy-700">{v.vehicle_type ?? "—"}</td>
                    <td className="px-5 py-3 text-navy-700">{v.max_weight_capacity != null ? `${v.max_weight_capacity.toLocaleString()} kg` : "—"}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => cycleStatus(v)}
                        disabled={busyId === v.id}
                        className="cursor-pointer disabled:opacity-50"
                        title="Click to change status"
                      >
                        <Badge tone={statusTone[v.current_status]}>{v.current_status.replace("_", " ")}</Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <Button variant="danger" size="sm" disabled={busyId === v.id} onClick={() => remove(v.id)}>
                          {busyId === v.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Register Vehicle" size="md">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Plate Number" error={errors.plate} required>
              <input value={form.plate} onChange={(e) => set("plate", e.target.value)} className={inputClass(!!errors.plate)} placeholder="e.g. 1234-AB-56" />
            </Field>
            <Field label="Vehicle Type" error={errors.type} required>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputClass(!!errors.type)}>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Max Weight Capacity (kg)" error={errors.capacity} required>
            <input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} className={inputClass(!!errors.capacity)} placeholder="20000" />
          </Field>

          {submitError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{submitError}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {submitting ? "Saving…" : "Register Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-800 bg-navy-950 p-5 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-accent-500 text-white" : "bg-navy-800 text-accent-400"}`}>
        {icon}
      </span>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${accent ? "text-accent-500" : "text-white"}`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy-500" aria-hidden="true" /> : value.toLocaleString()}
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</p>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:border-accent-400 ${
    hasError ? "border-red-300" : "border-navy-200"
  }`;
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-800">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

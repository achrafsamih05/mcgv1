"use client";

import { useState } from "react";
import { ImageIcon, MapPin, Maximize, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_ANCILLARY_SERVICES,
  WAREHOUSE_CATEGORIES,
  type AncillaryService,
  type FacilityAvailability,
  type WarehouseCategory,
  type WarehouseFacility,
} from "@/lib/warehouse/types";
import { can, scopeToTenant, type OperatorSession } from "@/lib/warehouse/rbac";
import { AvailabilityBadge, Badge, Button, Panel, PanelHeader, StatusToggle, VerificationBadge } from "../ui";
import { FacilityWizard } from "./FacilityWizard";
import { Modal } from "@/components/admin/ui/Modal";

export function FacilitiesSection({
  session,
  seedFacilities,
}: {
  session: OperatorSession;
  seedFacilities: WarehouseFacility[];
}) {
  const [facilities, setFacilities] = useState<WarehouseFacility[]>(() =>
    scopeToTenant(session, seedFacilities)
  );
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canManage = can(session, "facility:manage");

  const setStatus = (id: string, availability: FacilityAvailability) =>
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, availability } : f)));

  const addFacility = (f: WarehouseFacility) => setFacilities((prev) => [f, ...prev]);

  const confirmDelete = () => {
    if (!deleteId) return;
    setFacilities((prev) => prev.filter((f) => f.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <Panel>
      <PanelHeader
        title="Your Facilities"
        description={`${facilities.length} warehouses listed`}
        action={
          <Button onClick={() => setWizardOpen(true)} disabled={!canManage}>
            <Plus className="h-4 w-4" aria-hidden="true" />List Warehouse
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2 xl:grid-cols-3">
        {facilities.map((f) => {
          const occupancy = Math.round(((f.totalAreaSqm - f.availableSqm) / f.totalAreaSqm) * 100);
          return (
            <div key={f.id} className="flex flex-col overflow-hidden rounded-xl border border-navy-100 transition-shadow duration-200 hover:shadow-md">
              <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                <ImageIcon className="h-8 w-8 text-white/30" aria-hidden="true" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{f.imageCount} photos</span>
                <span className="absolute right-3 top-3"><AvailabilityBadge status={f.availability} /></span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-1.5 font-semibold text-navy-900">
                    <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />{f.name}
                  </h3>
                  <Badge tone="neutral">{f.category}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-navy-500">{f.city}, {f.country}</p>

                {/* Occupancy */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-navy-600">
                    <span className="inline-flex items-center gap-1"><Maximize className="h-3.5 w-3.5" aria-hidden="true" />{f.availableSqm.toLocaleString()} / {f.totalAreaSqm.toLocaleString()} sqm free</span>
                    <span className="font-semibold">{occupancy}% used</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy-100">
                    <div className={`h-full rounded-full ${occupancy >= 100 ? "bg-red-500" : "bg-accent-500"}`} style={{ width: `${Math.min(100, occupancy)}%` }} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Spec label="Monthly" value={`$${f.pricing.monthly}/sqm`} accent />
                  <Spec label="Clearance" value={`${f.clearanceHeightM} m`} />
                  <Spec label="Floors" value={f.floors.toString()} />
                  <Spec label="Floor" value={f.floorType} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {f.services.filter((s) => s.enabled).map((s) => (
                    <span key={s.key} className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-600">{s.label}</span>
                  ))}
                </div>

                <div className="mt-3"><VerificationBadge state={f.verification} /></div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-navy-100 pt-3">
                  <StatusToggle status={f.availability} onChange={(s) => setStatus(f.id, s)} />
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" aria-hidden="true" />Edit</Button>
                    <Button variant="danger" size="sm" disabled={!canManage} onClick={() => setDeleteId(f.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {facilities.length === 0 && (
          <p className="col-span-full py-12 text-center text-navy-400">No warehouses yet. List your first facility.</p>
        )}
      </div>

      <FacilityWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        operatorId={session.operatorId}
        onCreate={addFacility}
      />

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Warehouse" size="sm">
        <p className="text-sm text-navy-600">This removes the facility listing permanently. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</Button>
        </div>
      </Modal>
    </Panel>
  );
}

function Spec({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-navy-50 px-2.5 py-1.5">
      <p className="text-[11px] text-navy-500">{label}</p>
      <p className={`font-semibold ${accent ? "text-accent-600" : "text-navy-900"}`}>{value}</p>
    </div>
  );
}

// Re-export the default services so the wizard can seed them.
export { DEFAULT_ANCILLARY_SERVICES };
export type { AncillaryService, WarehouseCategory };
export { WAREHOUSE_CATEGORIES };

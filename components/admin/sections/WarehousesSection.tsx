"use client";

import { useState } from "react";
import { Check, ImageIcon, MapPin, Maximize, Pencil, ShieldCheck, Trash2, X } from "lucide-react";
import type { VerificationStatus, Warehouse } from "@/lib/admin/types";
import { warehouses as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, Toggle, VerifiedPill } from "../ui/primitives";

const statusTone: Record<VerificationStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
};

export function WarehousesSection() {
  const [list, setList] = useState<Warehouse[]>(seed);

  const setStatus = (id: string, status: VerificationStatus) =>
    setList((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));

  const toggleVerified = (id: string, next: boolean) =>
    setList((prev) => prev.map((w) => (w.id === id ? { ...w, verified: next } : w)));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {list.map((w) => (
        <Panel key={w.id} className="overflow-hidden">
          {/* Photo placeholder */}
          <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
            <ImageIcon className="h-10 w-10 text-white/30" aria-hidden="true" />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-navy-700">
              {w.photos} photos
            </span>
            <span className="absolute right-3 top-3">
              <Badge tone={statusTone[w.status]}>{w.status}</Badge>
            </span>
          </div>

          <div className="p-5">
            <h3 className="flex items-center gap-1.5 text-base font-semibold text-navy-900">
              <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />
              {w.name}
            </h3>
            <p className="mt-0.5 text-xs text-navy-500">{w.city} · {w.coordinates}</p>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-navy-50 p-2.5">
                <dt className="flex items-center gap-1 text-xs text-navy-500">
                  <Maximize className="h-3.5 w-3.5" aria-hidden="true" />Capacity
                </dt>
                <dd className="font-semibold text-navy-900">{w.capacitySqm.toLocaleString()} sqm</dd>
              </div>
              <div className="rounded-lg bg-navy-50 p-2.5">
                <dt className="flex items-center gap-1 text-xs text-navy-500">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Safety Docs
                </dt>
                <dd className="font-semibold text-navy-900">{w.safetyDocs} files</dd>
              </div>
              <div className="rounded-lg bg-navy-50 p-2.5">
                <dt className="text-xs text-navy-500">Daily</dt>
                <dd className="font-semibold text-navy-900">${w.dailyPrice}/sqm</dd>
              </div>
              <div className="rounded-lg bg-navy-50 p-2.5">
                <dt className="text-xs text-navy-500">Monthly</dt>
                <dd className="font-semibold text-navy-900">${w.monthlyPrice}/sqm</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-navy-100 p-3">
              <VerifiedPill label="Verified Warehouse" verified={w.verified} />
              <Toggle
                checked={w.verified}
                onChange={(next) => toggleVerified(w.id, next)}
                label={`Toggle verified badge for ${w.name}`}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="success" size="sm" onClick={() => setStatus(w.id, "Approved")}>
                <Check className="h-4 w-4" aria-hidden="true" />Approve
              </Button>
              <Button variant="danger" size="sm" onClick={() => setStatus(w.id, "Rejected")}>
                <X className="h-4 w-4" aria-hidden="true" />Reject
              </Button>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" aria-hidden="true" />Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatus(w.id, "Pending")}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />Delist
              </Button>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

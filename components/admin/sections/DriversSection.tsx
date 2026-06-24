"use client";

import { useState } from "react";
import { Check, ShieldX, Truck, UserCog, X } from "lucide-react";
import type { AccountStatus, Driver } from "@/lib/admin/types";
import { drivers as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, Toggle, VerifiedPill } from "../ui/primitives";

const statusTone: Record<AccountStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Active: "success",
  Pending: "warning",
  Suspended: "info",
  Banned: "danger",
  Deactivated: "neutral",
};

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${ok ? "text-emerald-600" : "text-red-600"}`}>
      {ok ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </span>
  );
}

export function DriversSection() {
  const [list, setList] = useState<Driver[]>(seed);

  const setStatus = (id: string, status: AccountStatus) =>
    setList((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  const toggleVerified = (id: string, next: boolean) =>
    setList((prev) => prev.map((d) => (d.id === id ? { ...d, verified: next } : d)));

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
      {list.map((d) => (
        <Panel key={d.id} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
                {d.kind === "Transport Company" ? (
                  <UserCog className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Truck className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <p className="font-semibold text-navy-900">{d.name}</p>
                <p className="text-xs text-navy-500">{d.kind} · {d.country}</p>
              </div>
            </div>
            <Badge tone={statusTone[d.status]}>{d.status}</Badge>
          </div>

          <p className="mt-4 text-sm text-navy-600">Vehicle: <span className="font-medium text-navy-800">{d.vehicle}</span></p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <CheckRow ok={d.licenseValid} label="Driving License" />
            <CheckRow ok={d.permitValid} label="Transport Permit" />
            <CheckRow ok={d.ownershipVerified} label="Vehicle Ownership" />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-navy-100 bg-navy-50/50 p-3">
            <VerifiedPill
              label={d.kind === "Transport Company" ? "Verified Transport Company" : "Verified Driver"}
              verified={d.verified}
            />
            <Toggle
              checked={d.verified}
              onChange={(next) => toggleVerified(d.id, next)}
              label={`Toggle verified badge for ${d.name}`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="success" size="sm" onClick={() => setStatus(d.id, "Active")}>
              <Check className="h-4 w-4" aria-hidden="true" />Accept
            </Button>
            <Button variant="danger" size="sm" onClick={() => setStatus(d.id, "Deactivated")}>
              <X className="h-4 w-4" aria-hidden="true" />Reject
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setStatus(d.id, "Suspended")}>
              <ShieldX className="h-4 w-4" aria-hidden="true" />Suspend
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStatus(d.id, "Active")}>
              Reinstate
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

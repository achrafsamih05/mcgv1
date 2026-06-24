"use client";

import { Check, Minus } from "lucide-react";
import type { SystemRole } from "@/lib/core/types";
import { ALL_CAPABILITIES, CAPABILITY_LABELS, ROLE_MATRIX, roleCan } from "@/lib/core/rbac";
import { Badge, Panel, PanelHeader } from "../ui";

const ROLES: SystemRole[] = ["Buyer", "Supplier", "Driver", "Warehouse Host", "Super Admin"];

export function RbacSection() {
  return (
    <div className="space-y-5">
      {/* Role cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ROLES.map((role) => {
          const cfg = ROLE_MATRIX[role];
          return (
            <Panel key={role} className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy-900">{role}</h3>
                {cfg.crossTenant && <Badge tone="accent">Cross-tenant</Badge>}
              </div>
              <p className="mt-1 text-xs text-navy-500">{cfg.description}</p>
              <p className="mt-3 text-xs font-medium text-navy-700">{cfg.capabilities.length} capabilities</p>
            </Panel>
          );
        })}
      </div>

      {/* Guard matrix grid */}
      <Panel>
        <PanelHeader title="RBAC Guard Matrix" description="Role → capability authorization map" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Capability</th>
                {ROLES.map((r) => <th key={r} className="px-3 py-3 text-center font-semibold">{r}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {ALL_CAPABILITIES.map((cap) => (
                <tr key={cap} className="hover:bg-navy-50/60">
                  <td className="px-5 py-2.5 font-medium text-navy-800">{CAPABILITY_LABELS[cap]}</td>
                  {ROLES.map((r) => {
                    const ok = roleCan(r, cap);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {ok ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-50 text-navy-300"><Minus className="h-3.5 w-3.5" aria-hidden="true" /></span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

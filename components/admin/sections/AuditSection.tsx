"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Lock, Search } from "lucide-react";
import { activityLogs } from "@/lib/admin/data";
import { Panel, PanelHeader } from "../ui/primitives";
import { LiveAuditTrailSection } from "./LiveAuditTrailSection";

export function AuditSection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      activityLogs.filter(
        (l) =>
          l.operator.toLowerCase().includes(query.toLowerCase()) ||
          l.operatorId.toLowerCase().includes(query.toLowerCase()) ||
          l.resource.toLowerCase().includes(query.toLowerCase()) ||
          l.action.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="space-y-6">
      <LiveAuditTrailSection />
      <Panel>
      <PanelHeader
        title="Immutable Audit Trail"
        description="Append-only — every privileged action is permanently recorded"
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />Tamper-proof
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="audit-search" className="sr-only">Search audit log</label>
              <input
                id="audit-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Operator, resource, action…"
                className="w-56 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">Operator</th>
              <th className="px-5 py-3 font-semibold">Targeted Resource</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Modification Delta</th>
              <th className="px-5 py-3 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="font-semibold text-navy-900">{l.operator}</div>
                  <div className="text-xs text-navy-500">{l.operatorId}</div>
                </td>
                <td className="px-5 py-3 font-medium text-navy-800">{l.resource}</td>
                <td className="px-5 py-3 text-navy-700">{l.action}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-red-50 px-2 py-0.5 font-medium text-red-700">{l.before}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-navy-400" aria-hidden="true" />
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{l.after}</span>
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-navy-600">{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
    </div>
  );
}

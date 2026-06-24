"use client";

import { useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { auditLogs } from "@/lib/core/data";
import { Panel, PanelHeader } from "../ui";

export function AuditSection() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      auditLogs.filter(
        (l) =>
          l.userMeta.toLowerCase().includes(query.toLowerCase()) ||
          l.userId.toLowerCase().includes(query.toLowerCase()) ||
          l.action.toLowerCase().includes(query.toLowerCase()) ||
          l.delta.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <Panel>
      <PanelHeader
        title="Immutable Audit Trail"
        description="Append-only event capture · User ID | Action Delta | ISO Date | System Time"
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />Tamper-proof
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="audit-search" className="sr-only">Search audit log</label>
              <input id="audit-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-52 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm focus:border-accent-400" />
            </div>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Delta Payload</th>
              <th className="px-5 py-3 font-semibold">ISO Date</th>
              <th className="px-5 py-3 font-semibold">System Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="font-semibold text-navy-900">{l.userMeta}</div>
                  <div className="text-xs text-navy-500">{l.userId}</div>
                </td>
                <td className="px-5 py-3"><span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700">{l.action}</span></td>
                <td className="px-5 py-3 text-navy-700">{l.delta}</td>
                <td className="px-5 py-3 font-mono text-xs text-navy-600">{l.isoDate}</td>
                <td className="px-5 py-3 font-mono text-xs text-navy-600">{l.systemTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

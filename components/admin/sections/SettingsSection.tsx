"use client";

import { useState } from "react";
import { KeyRound, Save, ShieldCheck } from "lucide-react";
import { Button, Panel, PanelHeader, Toggle } from "../ui/primitives";
import { BarChart, ChartLegend, LineChart } from "../ui/charts";

type StaffRole = { id: string; name: string; role: string; mfa: boolean; canDelete: boolean };

const initialStaff: StaffRole[] = [
  { id: "CEO-001", name: "CEO (Owner)", role: "Super Admin", mfa: true, canDelete: true },
  { id: "STAFF-009", name: "Finance Lead", role: "Finance Admin", mfa: true, canDelete: false },
  { id: "STAFF-014", name: "Ops Manager", role: "Operations", mfa: false, canDelete: false },
  { id: "STAFF-021", name: "Support Agent", role: "Moderator", mfa: true, canDelete: false },
];

export function SettingsSection() {
  const [staff, setStaff] = useState<StaffRole[]>(initialStaff);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [rateLimit, setRateLimit] = useState("100");
  const [saved, setSaved] = useState(false);

  const toggleStaffMfa = (id: string, next: boolean) =>
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, mfa: next } : s)));
  const toggleStaffDelete = (id: string, next: boolean) =>
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, canDelete: next } : s)));

  return (
    <div className="space-y-5">
      {/* System config */}
      <Panel>
        <PanelHeader title="System Configuration" description="Global platform identity" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Platform Name" defaultValue="MCG Global" />
          <Field label="System Support Email" defaultValue="support@mcg-global.com" type="email" />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-navy-800">Default Language</span>
            <select className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              <option>English</option>
              <option>Arabic</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-navy-800">Platform Logo</span>
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 py-2.5 text-sm text-navy-500">
              Upload logo asset
            </div>
          </div>
        </div>
      </Panel>

      {/* Security grid (RBAC + 2FA + rate limit) */}
      <Panel>
        <PanelHeader
          title="Security & RBAC"
          description="Staff permissions, 2FA enforcement & rate limiting"
          action={
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-navy-700">Enforce 2FA globally</span>
              <Toggle checked={enforce2FA} onChange={setEnforce2FA} label="Enforce 2FA globally" />
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Staff</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">2FA Enabled</th>
                <th className="px-5 py-3 font-semibold">Can Delete Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-navy-900">{s.name}</div>
                    <div className="text-xs text-navy-500">{s.id}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-navy-700">
                      <KeyRound className="h-4 w-4 text-navy-400" aria-hidden="true" />{s.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Toggle checked={s.mfa} onChange={(n) => toggleStaffMfa(s.id, n)} label={`Toggle 2FA for ${s.name}`} />
                  </td>
                  <td className="px-5 py-3">
                    <Toggle
                      checked={s.canDelete}
                      onChange={(n) => toggleStaffDelete(s.id, n)}
                      label={`Toggle delete permission for ${s.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-navy-100 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xs">
            <label htmlFor="rate-limit" className="mb-1.5 block text-sm font-medium text-navy-800">
              API Rate Limit (req/min per IP)
            </label>
            <input
              id="rate-limit"
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            />
          </div>
          <div className="flex items-center gap-3">
            {saved && <span role="status" className="text-sm font-medium text-emerald-600">Security settings saved.</span>}
            <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
              <Save className="h-4 w-4" aria-hidden="true" />Save Settings
            </Button>
          </div>
        </div>
      </Panel>

      {/* Strategic BI */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="User Acquisition & Net Profit Growth" description="Strategic BI — trailing periods" />
          <div className="p-5">
            <ChartLegend items={[{ label: "Acquisition", color: "#0F172A" }, { label: "Net Profit", color: "#F97316" }]} />
            <div className="mt-3 h-56">
              <LineChart
                series={[
                  { label: "Acquisition", color: "#0F172A", points: [200, 320, 410, 480, 620, 760, 910] },
                  { label: "Net Profit", color: "#F97316", points: [120, 180, 240, 300, 420, 560, 690] },
                ]}
              />
            </div>
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Trade Volume — MoM vs YoY" description="Ecosystem volumetric trade cap, in $K" />
          <div className="p-5">
            <ChartLegend items={[{ label: "This Year", color: "#0F172A" }, { label: "Last Year", color: "#F97316" }]} />
            <div className="mt-3 h-56">
              <BarChart
                data={[
                  { label: "Q1", value: 6200, secondary: 4100 },
                  { label: "Q2", value: 7400, secondary: 4800 },
                  { label: "Q3", value: 8100, secondary: 5600 },
                  { label: "Q4", value: 9300, secondary: 6200 },
                ]}
              />
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        <p>All privileged configuration changes are recorded in the immutable audit trail with operator ID and timestamp.</p>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-800">{label}</label>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
      />
    </div>
  );
}

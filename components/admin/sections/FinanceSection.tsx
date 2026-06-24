"use client";

import { Banknote, Building2, PiggyBank, Truck, Wallet } from "lucide-react";
import { Panel, PanelHeader } from "../ui/primitives";
import { BarChart, ChartLegend } from "../ui/charts";

const tiles = [
  { id: "commissions", label: "Platform Commissions", value: "$1.84M", icon: Wallet, tone: "text-accent-600", delta: "+12% MoM" },
  { id: "suppliers", label: "Suppliers Earnings", value: "$42.6M", icon: Building2, tone: "text-navy-900", delta: "+8% MoM" },
  { id: "fleet", label: "Logistics Fleet Payouts", value: "$6.2M", icon: Truck, tone: "text-navy-900", delta: "+5% MoM" },
  { id: "warehouse", label: "Warehouse Fees Generated", value: "$3.1M", icon: PiggyBank, tone: "text-navy-900", delta: "+7% MoM" },
  { id: "net", label: "Net Platform Profit", value: "$1.21M", icon: Banknote, tone: "text-emerald-600", delta: "+14% MoM" },
];

export function FinanceSection() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-navy-500">{t.label}</p>
              <p className={`mt-1 text-xl font-bold ${t.tone}`}>{t.value}</p>
              <p className="mt-0.5 text-xs font-medium text-emerald-600">{t.delta}</p>
            </div>
          );
        })}
      </div>

      <Panel>
        <PanelHeader title="Revenue Breakdown" description="Commissions vs payouts, in $K" />
        <div className="p-5">
          <ChartLegend
            items={[
              { label: "Gross Revenue", color: "#0F172A" },
              { label: "Net Profit", color: "#F97316" },
            ]}
          />
          <div className="mt-3 h-64">
            <BarChart
              data={[
                { label: "Jan", value: 1800, secondary: 540 },
                { label: "Feb", value: 2100, secondary: 620 },
                { label: "Mar", value: 1950, secondary: 580 },
                { label: "Apr", value: 2300, secondary: 710 },
                { label: "May", value: 2410, secondary: 760 },
                { label: "Jun", value: 2620, secondary: 820 },
              ]}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

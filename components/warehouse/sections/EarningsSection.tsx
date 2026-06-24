"use client";

import { CalendarDays, CalendarRange, DollarSign, TrendingUp } from "lucide-react";
import type { WarehouseEarnings } from "@/lib/warehouse/types";
import { Panel, PanelHeader } from "../ui";
import { BarChart, ChartLegend } from "@/components/admin/ui/charts";

export function EarningsSection({ earnings }: { earnings: WarehouseEarnings }) {
  const tiles = [
    { id: "today", label: "Today's Earnings", value: earnings.today, icon: DollarSign, accent: true },
    { id: "weekly", label: "Weekly Summary", value: earnings.weekly, icon: CalendarDays, accent: false },
    { id: "monthly", label: "Monthly Run-rate", value: earnings.monthly, icon: CalendarRange, accent: false },
    { id: "lifetime", label: "Gross Lifetime Revenue", value: earnings.lifetime, icon: TrendingUp, accent: false },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.accent ? "bg-accent-500 text-white" : "bg-navy-50 text-navy-700"}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className={`mt-3 text-2xl font-bold ${t.accent ? "text-accent-600" : "text-navy-900"}`}>${t.value.toLocaleString()}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{t.label}</p>
            </div>
          );
        })}
      </div>

      <Panel>
        <PanelHeader title="Monthly Revenue Trend" description="Storage income, in $K" />
        <div className="p-5">
          <ChartLegend items={[{ label: "Revenue", color: "#0F172A" }, { label: "Occupancy %", color: "#F97316" }]} />
          <div className="mt-3 h-64">
            <BarChart
              data={[
                { label: "Jan", value: 52, secondary: 68 },
                { label: "Feb", value: 58, secondary: 72 },
                { label: "Mar", value: 61, secondary: 75 },
                { label: "Apr", value: 64, secondary: 79 },
                { label: "May", value: 66, secondary: 82 },
                { label: "Jun", value: 68, secondary: 85 },
              ]}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

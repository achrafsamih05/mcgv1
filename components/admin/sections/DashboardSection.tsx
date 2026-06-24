"use client";

import type { StatCardData } from "@/lib/admin/types";
import { StatCard } from "../ui/StatCard";
import { Panel, PanelHeader } from "../ui/primitives";
import { BarChart, ChartLegend, DonutChart, LineChart } from "../ui/charts";
import { LiveMetricsSection } from "./LiveMetricsSection";
import { VerificationSection } from "./VerificationSection";
import { GlobalOverseerSection } from "./GlobalOverseerSection";

const userStats: StatCardData[] = [
  { id: "u-total", label: "Total Users", value: "8,412", delta: 12, intent: "accent" },
  { id: "u-buyers", label: "Buyers", value: "5,140", delta: 9 },
  { id: "u-suppliers", label: "Suppliers", value: "1,260", delta: 6 },
  { id: "u-drivers", label: "Drivers", value: "880", delta: 14 },
  { id: "u-transport", label: "Transport Cos.", value: "212", delta: 4 },
  { id: "u-warehouses", label: "Warehouses", value: "104", delta: 3 },
];

const opsStats: StatCardData[] = [
  { id: "o-orders", label: "Total Orders", value: "12,907", delta: 8 },
  { id: "o-closed", label: "Closed Deals", value: "9,331", delta: 11 },
  { id: "o-active", label: "Active Shipments", value: "486", delta: 5, intent: "accent" },
  { id: "o-flagged", label: "Flagged Messages", value: "23", delta: -18, intent: "danger" },
];

const bizStats: StatCardData[] = [
  { id: "b-new", label: "Today's New Orders", value: "47", delta: 6 },
  { id: "b-contracts", label: "Active Contracts", value: "318", delta: 9 },
  { id: "b-warehouses", label: "Booked Warehouses", value: "76", delta: 3 },
  { id: "b-fleet", label: "Active Fleet / Trips", value: "204", delta: 7 },
  { id: "b-daily", label: "Daily Revenue", value: "$84.2K", delta: 5, intent: "success" },
  { id: "b-monthly", label: "Monthly Revenue", value: "$2.41M", delta: 12, intent: "success" },
  { id: "b-gmv", label: "Annual GMV", value: "$118.6M", delta: 21, intent: "accent" },
];

export function DashboardSection() {
  return (
    <div className="space-y-8">
      {/* LIVE — global platform metrics (Supabase aggregates) */}
      <LiveMetricsSection />

      {/* LIVE — pending account verification pipeline */}
      <VerificationSection />

      {/* LIVE — cross-tenant deal & shipment overseer with stage override */}
      <GlobalOverseerSection />

      {/* Users counters */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy-700">Users Management</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {userStats.map((s) => (
            <StatCard key={s.id} data={s} />
          ))}
        </div>
      </section>

      {/* Core operations */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy-700">Core Operations</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {opsStats.map((s) => (
            <StatCard key={s.id} data={s} />
          ))}
        </div>
      </section>

      {/* Business KPIs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy-700">Business Operations KPIs</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {bizStats.map((s) => (
            <StatCard key={s.id} data={s} />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="User Growth & Order Velocity"
            description="Trailing 7 periods"
          />
          <div className="p-5">
            <ChartLegend
              items={[
                { label: "New Users", color: "#0F172A" },
                { label: "Orders", color: "#F97316" },
              ]}
            />
            <div className="mt-3 h-56">
              <LineChart
                series={[
                  { label: "New Users", color: "#0F172A", points: [120, 180, 160, 240, 280, 260, 340] },
                  { label: "Orders", color: "#F97316", points: [80, 110, 140, 130, 200, 240, 300] },
                ]}
              />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Revenue & Profit Margins"
            description="Monthly, in $K"
          />
          <div className="p-5">
            <ChartLegend
              items={[
                { label: "Revenue", color: "#0F172A" },
                { label: "Profit", color: "#F97316" },
              ]}
            />
            <div className="mt-3 h-56">
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

        <Panel>
          <PanelHeader title="Top Requested Products" />
          <div className="p-5">
            <DonutChart
              data={[
                { label: "Electronics", value: 38, color: "#F97316" },
                { label: "Heavy Equipment", value: 24, color: "#0F172A" },
                { label: "Furniture", value: 18, color: "#3b82f6" },
                { label: "Fashion", value: 12, color: "#10b981" },
                { label: "Other", value: 8, color: "#94a3b8" },
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Most Active Trading Countries" />
          <div className="p-5">
            <DonutChart
              data={[
                { label: "China", value: 52, color: "#F97316" },
                { label: "Morocco", value: 28, color: "#0F172A" },
                { label: "UAE", value: 10, color: "#3b82f6" },
                { label: "Turkey", value: 6, color: "#10b981" },
                { label: "Other", value: 4, color: "#94a3b8" },
              ]}
            />
          </div>
        </Panel>
      </section>
    </div>
  );
}

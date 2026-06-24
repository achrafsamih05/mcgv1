"use client";

import { CalendarCheck, CheckCircle2, DollarSign, FileStack, Warehouse } from "lucide-react";
import type {
  SpaceBookingRequest,
  WarehouseAnalytics,
  WarehouseEarnings,
} from "@/lib/warehouse/types";
import { Badge, Panel, PanelHeader, StatBlock } from "../ui";

export function HomeSection({
  analytics,
  earnings,
  recentBookings,
}: {
  analytics: WarehouseAnalytics;
  earnings: WarehouseEarnings;
  recentBookings: SpaceBookingRequest[];
}) {
  return (
    <div className="space-y-6">
      {/* Operational metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatBlock label="Warehouses" value={analytics.totalWarehouses.toString()} icon={<Warehouse className="h-5 w-5" />} accent />
        <StatBlock label="Lifetime Bookings" value={analytics.lifetimeBookings.toString()} icon={<FileStack className="h-5 w-5" />} />
        <StatBlock label="Active Contracts" value={analytics.activeContracts.toString()} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatBlock label="Completed" value={analytics.completedBookings.toString()} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatBlock label="Gross Revenue" value={`$${(analytics.grossRevenue / 1000).toFixed(0)}K`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Financial analytics grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FinanceTile label="Today's Earnings" value={earnings.today} accent />
        <FinanceTile label="Weekly Summary" value={earnings.weekly} />
        <FinanceTile label="Monthly Run-rate" value={earnings.monthly} />
        <FinanceTile label="Lifetime Revenue" value={earnings.lifetime} />
      </div>

      <Panel>
        <PanelHeader title="Latest Booking Requests" description="New RFQs needing your response" />
        <ul className="divide-y divide-navy-100">
          {recentBookings.slice(0, 4).map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{b.facilityName}</p>
                <p className="text-xs text-navy-500">{b.clientName} · {b.spaceSqm.toLocaleString()} sqm · {b.durationDays} days</p>
              </div>
              <Badge tone={b.status === "New" ? "accent" : b.status === "Quoted" ? "info" : b.status === "Accepted" ? "success" : "neutral"}>
                {b.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function FinanceTile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${accent ? "text-accent-600" : "text-navy-900"}`}>${value.toLocaleString()}</p>
    </div>
  );
}

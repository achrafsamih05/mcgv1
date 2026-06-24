"use client";

import { DollarSign, Handshake, Package, TrendingUp, Users } from "lucide-react";
import type { CurrencyCode } from "@/lib/core/types";
import {
  activeSuppliers,
  distributionCities,
  executiveKPIs,
  momPerformance,
  topItems,
} from "@/lib/core/data";
import { formatMoney } from "@/lib/core/i18n";
import { HeatList, Panel, PanelHeader, StatBlock } from "../ui";
import { BarChart, ChartLegend, LineChart } from "@/components/admin/ui/charts";

export function BiSection({ currency }: { currency: CurrencyCode }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatBlock label="User Acquisitions" value={executiveKPIs.userAcquisitions.toLocaleString()} icon={<Users className="h-5 w-5" />} accent hint="+12% MoM" />
        <StatBlock label="Commerce Cap (GMV)" value={formatMoney(executiveKPIs.volumetricCommerceCap, currency)} icon={<TrendingUp className="h-5 w-5" />} hint="+21% YoY" />
        <StatBlock label="Total Orders" value={executiveKPIs.totalOrders.toLocaleString()} icon={<Package className="h-5 w-5" />} hint="+8% MoM" />
        <StatBlock label="Closed Deals" value={executiveKPIs.closedDeals.toLocaleString()} icon={<Handshake className="h-5 w-5" />} hint="+11% MoM" />
        <StatBlock label="Profit Margin" value={`${executiveKPIs.profitMargin}%`} icon={<DollarSign className="h-5 w-5" />} hint="+1.4 pts" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="MoM Performance" description="Revenue vs profit, in $K" />
          <div className="p-5">
            <ChartLegend items={[{ label: "Revenue", color: "#0F172A" }, { label: "Profit", color: "#F97316" }]} />
            <div className="mt-3 h-56"><BarChart data={momPerformance} /></div>
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="User Acquisition Curve" description="Trailing periods" />
          <div className="p-5">
            <ChartLegend items={[{ label: "New Users", color: "#0F172A" }, { label: "Active Deals", color: "#F97316" }]} />
            <div className="mt-3 h-56">
              <LineChart series={[
                { label: "Users", color: "#0F172A", points: [200, 320, 410, 480, 620, 760, 910] },
                { label: "Deals", color: "#F97316", points: [120, 180, 240, 300, 420, 560, 690] },
              ]} />
            </div>
          </div>
        </Panel>
      </div>

      {/* Demand heat-maps */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Top Requested Items" />
          <div className="p-5"><HeatList items={topItems} /></div>
        </Panel>
        <Panel>
          <PanelHeader title="Hyper-Active Suppliers" />
          <div className="p-5"><HeatList items={activeSuppliers} /></div>
        </Panel>
        <Panel>
          <PanelHeader title="High-Density Cities" />
          <div className="p-5"><HeatList items={distributionCities} /></div>
        </Panel>
      </div>
    </div>
  );
}

"use client";

import { CheckCircle2, Clock, DollarSign, ListChecks, Star } from "lucide-react";
import type { FreightOrder, ProviderAnalytics } from "@/lib/logistics/types";
import { Badge, Panel, PanelHeader, StatBlock } from "../ui";

export function HomeSection({
  analytics,
  recentJobs,
}: {
  analytics: ProviderAnalytics;
  recentJobs: FreightOrder[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatBlock label="Assigned Tasks" value={analytics.assignedTasks.toString()} icon={<ListChecks className="h-5 w-5" />} accent />
        <StatBlock label="Pending Requests" value={analytics.pendingRequests.toString()} icon={<Clock className="h-5 w-5" />} />
        <StatBlock label="Completed" value={analytics.completedDeliveries.toString()} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatBlock label="Global Rating" value={analytics.rating.toFixed(1)} icon={<Star className="h-5 w-5" />} />
        <StatBlock label="Earnings" value={`$${analytics.earnings.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      <Panel>
        <PanelHeader title="Latest Freight Requests" description="New jobs needing your response" />
        <ul className="divide-y divide-navy-100">
          {recentJobs.slice(0, 4).map((j) => (
            <li key={j.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{j.origin} → {j.destination}</p>
                <p className="text-xs text-navy-500">{j.clientName} · {j.cargoType} · {j.weightKg.toLocaleString()} kg</p>
              </div>
              <Badge tone={j.status === "New" ? "accent" : j.status === "Quoted" ? "info" : j.status === "Accepted" ? "success" : "neutral"}>
                {j.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

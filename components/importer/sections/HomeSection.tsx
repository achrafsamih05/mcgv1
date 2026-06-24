"use client";

import { Bell, Bookmark, FileText, Handshake, Ship } from "lucide-react";
import type {
  ImporterAnalytics,
  SourcingRFQ,
  TrackingTimelineState,
} from "@/lib/importer/types";
import { TRACKING_MILESTONES } from "@/lib/importer/types";
import { Badge, Panel, PanelHeader, StatBlock, rfqStatusTone } from "../ui";

export function HomeSection({
  analytics,
  rfqs,
  shipments,
}: {
  analytics: ImporterAnalytics;
  rfqs: SourcingRFQ[];
  shipments: TrackingTimelineState[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatBlock label="Active RFQs" value={analytics.activeRFQs.toString()} icon={<FileText className="h-5 w-5" />} accent />
        <StatBlock label="Ongoing Deals" value={analytics.ongoingDeals.toString()} icon={<Handshake className="h-5 w-5" />} />
        <StatBlock label="Live Shipments" value={analytics.liveShipments.toString()} icon={<Ship className="h-5 w-5" />} />
        <StatBlock label="Saved Suppliers" value={analytics.savedSuppliers.toString()} icon={<Bookmark className="h-5 w-5" />} />
        <StatBlock label="Unread Alerts" value={analytics.unreadAlerts.toString()} icon={<Bell className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Recent RFQs" description="Your latest sourcing requests" />
          <ul className="divide-y divide-navy-100">
            {rfqs.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-900">{r.title}</p>
                  <p className="text-xs text-navy-500">{r.category} · {r.quantity.toLocaleString()} units</p>
                </div>
                <Badge tone={rfqStatusTone(r.status)}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Live Shipments" description="Cargo currently in motion" />
          <ul className="divide-y divide-navy-100">
            {shipments.map((s) => {
              const pct = Math.round(((TRACKING_MILESTONES.indexOf(s.currentMilestone) + 1) / TRACKING_MILESTONES.length) * 100);
              return (
                <li key={s.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy-900">{s.product}</p>
                    <span className="text-xs font-semibold text-accent-600">{pct}%</span>
                  </div>
                  <p className="text-xs text-navy-500">{s.currentMilestone}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-navy-100">
                    <div className="h-full rounded-full bg-accent-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

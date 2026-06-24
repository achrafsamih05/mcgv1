"use client";

import { Eye, Inbox, MessageSquare, Package, Users } from "lucide-react";
import type { IncomingRequest, SupplierAnalytics } from "@/lib/supplier/types";
import { Badge, Panel, PanelHeader, StatBlock } from "../ui";

export function HomeSection({
  analytics,
  recentRequests,
}: {
  analytics: SupplierAnalytics;
  recentRequests: IncomingRequest[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatBlock label="Live Products" value={analytics.liveProducts.toString()} icon={<Package className="h-5 w-5" />} accent />
        <StatBlock label="Active Orders" value={analytics.activeOrders.toString()} icon={<Inbox className="h-5 w-5" />} />
        <StatBlock label="Unread Messages" value={analytics.unreadMessages.toString()} icon={<MessageSquare className="h-5 w-5" />} />
        <StatBlock label="Storefront Views" value={analytics.pageViews.toLocaleString()} icon={<Eye className="h-5 w-5" />} />
        <StatBlock label="Unique Buyers" value={analytics.uniqueBuyers.toString()} icon={<Users className="h-5 w-5" />} />
      </div>

      <Panel>
        <PanelHeader title="Latest Buyer Requests" description="Most recent RFQs needing your attention" />
        <ul className="divide-y divide-navy-100">
          {recentRequests.slice(0, 4).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{r.productName}</p>
                <p className="text-xs text-navy-500">
                  {r.buyerName} · {r.buyerCountry} · {r.quantity.toLocaleString()} units
                </p>
              </div>
              <Badge tone={r.status === "New" ? "accent" : r.status === "Accepted" ? "success" : r.status === "Quoted" ? "info" : "neutral"}>
                {r.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

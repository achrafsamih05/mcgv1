"use client";

import { Bell, ExternalLink, Menu } from "lucide-react";
import type { Availability, LogisticsSectionId } from "@/lib/logistics/types";
import { logisticsSectionMeta } from "./nav";
import { AvailabilityBadge } from "./ui";

export function LogisticsTopbar({
  section,
  availability,
  onCycleAvailability,
  onOpenMobile,
  onViewPublic,
}: {
  section: LogisticsSectionId;
  availability: Availability;
  onCycleAvailability: () => void;
  onOpenMobile: () => void;
  onViewPublic: () => void;
}) {
  const { title, subtitle } = logisticsSectionMeta[section];
  return (
    <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open menu"
          className="cursor-pointer rounded-lg p-2 text-navy-700 hover:bg-navy-100 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-navy-900">{title}</h1>
          <p className="truncate text-xs text-navy-500">{subtitle}</p>
        </div>

        {/* Live availability switch */}
        <button
          type="button"
          onClick={onCycleAvailability}
          aria-label="Toggle availability status"
          className="cursor-pointer rounded-lg transition-transform duration-150 hover:scale-105"
        >
          <AvailabilityBadge status={availability} />
        </button>

        <button
          type="button"
          onClick={onViewPublic}
          className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-sm font-semibold text-navy-700 transition-colors duration-200 hover:bg-navy-50 sm:flex"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Public Profile
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative cursor-pointer rounded-lg p-2 text-navy-700 hover:bg-navy-100"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500" />
        </button>
      </div>
    </header>
  );
}

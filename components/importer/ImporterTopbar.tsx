"use client";

import { Bell, Menu, Plus } from "lucide-react";
import type { ImporterSectionId } from "@/lib/importer/types";
import { importerSectionMeta } from "./nav";

export function ImporterTopbar({
  section,
  alerts,
  onOpenMobile,
  onNewRFQ,
}: {
  section: ImporterSectionId;
  alerts: number;
  onOpenMobile: () => void;
  onNewRFQ: () => void;
}) {
  const { title, subtitle } = importerSectionMeta[section];
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
        <button
          type="button"
          onClick={onNewRFQ}
          className="hidden cursor-pointer items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600 sm:flex"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New RFQ
        </button>
        <button
          type="button"
          aria-label={`Notifications, ${alerts} unread`}
          className="relative cursor-pointer rounded-lg p-2 text-navy-700 hover:bg-navy-100"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {alerts > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">{alerts}</span>}
        </button>
      </div>
    </header>
  );
}

"use client";

import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import { sectionTitles } from "./nav";
import type { AdminSectionId } from "@/lib/admin/types";

export function Topbar({
  section,
  onOpenMobile,
}: {
  section: AdminSectionId;
  onOpenMobile: () => void;
}) {
  const { title, subtitle } = sectionTitles[section];

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

        {/* Instant search */}
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
            aria-hidden="true"
          />
          <label htmlFor="global-search" className="sr-only">
            Search the platform
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="Search users, orders, disputes…"
            className="w-64 rounded-lg border border-navy-200 bg-navy-50 py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-200 focus:border-accent-400 focus:bg-white"
          />
        </div>

        {/* MFA indicator (security-first placeholder) */}
        <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          MFA Verified
        </span>

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

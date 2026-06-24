"use client";

import {
  LayoutDashboard,
  MessageSquare,
  PackageSearch,
  Route,
  Ship,
  Truck,
  UserCog,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import type {
  Availability,
  LogisticsSectionId,
  ProviderKind,
  VerificationState,
} from "@/lib/logistics/types";
import { logisticsNav } from "./nav";
import { AvailabilityBadge, VerificationBadge } from "./ui";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Truck,
  PackageSearch,
  Route,
  Wallet,
  MessageSquare,
  UserCog,
};

export function LogisticsSidebar({
  active,
  onSelect,
  displayName,
  kind,
  verification,
  availability,
  unread,
  mobileOpen,
  onCloseMobile,
}: {
  active: LogisticsSectionId;
  onSelect: (id: LogisticsSectionId) => void;
  displayName: string;
  kind: ProviderKind;
  verification: VerificationState;
  availability: Availability;
  unread: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-950 text-navy-100 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Logistics navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
              <Ship className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">MCG <span className="text-accent-500">Logistics</span></p>
              <p className="text-[11px] uppercase tracking-wider text-navy-400">Driver Console</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="cursor-pointer rounded-lg p-1.5 text-navy-300 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {logisticsNav.map((item) => {
              const Icon = icons[item.icon];
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive ? "bg-accent-500 text-white shadow-sm" : "text-navy-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {item.label}
                    {item.id === "messages" && unread > 0 && (
                      <span className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white">{unread}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
          <VerificationBadge state={verification} kind={kind} />
          <AvailabilityBadge status={availability} />
        </div>
      </aside>
    </>
  );
}

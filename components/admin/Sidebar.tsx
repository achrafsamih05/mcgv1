"use client";

import {
  BadgeCheck,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Package,
  Radar,
  Scale,
  Settings,
  Ship,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Wallet,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminSectionId } from "@/lib/admin/types";
import { navItems, type NavItem } from "./nav";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Truck,
  Warehouse,
  Package,
  ClipboardList,
  Handshake,
  Radar,
  Scale,
  MessageSquareWarning,
  Star,
  Megaphone,
  Wallet,
  FileText,
  ShieldCheck,
  Settings,
};

const groupOrder: NavItem["group"][] = [
  "Overview",
  "Verification",
  "Operations",
  "Trust & Safety",
  "Platform",
];

export function Sidebar({
  active,
  onSelect,
  mobileOpen,
  onCloseMobile,
}: {
  active: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-950 text-navy-100 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2.5 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
              <Ship className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">
                MCG <span className="text-accent-500">Global</span>
              </p>
              <p className="text-[11px] uppercase tracking-wider text-navy-400">
                Command Center
              </p>
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

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groupOrder.map((group) => (
            <div key={group} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                {group}
              </p>
              <ul className="space-y-0.5">
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = icons[item.icon];
                    const isActive = active === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(item.id)}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                            isActive
                              ? "bg-accent-500 text-white shadow-sm"
                              : "text-navy-200 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        {/* CEO identity footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">
              CE
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">CEO / Owner</p>
              <p className="flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                MFA Active
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

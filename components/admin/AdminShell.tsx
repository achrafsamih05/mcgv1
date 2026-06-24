"use client";

import { useState } from "react";
import type { AdminSectionId } from "@/lib/admin/types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DashboardSection } from "./sections/DashboardSection";
import { UsersSection } from "./sections/UsersSection";
import { SuppliersSection } from "./sections/SuppliersSection";
import { DriversSection } from "./sections/DriversSection";
import { WarehousesSection } from "./sections/WarehousesSection";
import { ProductsSection } from "./sections/ProductsSection";
import { OrdersSection } from "./sections/OrdersSection";
import { DealsSection } from "./sections/DealsSection";
import { TrackingSection } from "./sections/TrackingSection";
import { DisputesSection } from "./sections/DisputesSection";
import { ModerationSection } from "./sections/ModerationSection";
import { BroadcastSection } from "./sections/BroadcastSection";
import { FinanceSection } from "./sections/FinanceSection";
import { CmsSection } from "./sections/CmsSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { AuditSection } from "./sections/AuditSection";
import { SettingsSection } from "./sections/SettingsSection";

const sections: Record<AdminSectionId, React.ComponentType> = {
  dashboard: DashboardSection,
  users: UsersSection,
  suppliers: SuppliersSection,
  drivers: DriversSection,
  warehouses: WarehousesSection,
  products: ProductsSection,
  orders: OrdersSection,
  deals: DealsSection,
  tracking: TrackingSection,
  disputes: DisputesSection,
  moderation: ModerationSection,
  broadcast: BroadcastSection,
  finance: FinanceSection,
  cms: CmsSection,
  reviews: ReviewsSection,
  audit: AuditSection,
  settings: SettingsSection,
};

export function AdminShell() {
  const [active, setActive] = useState<AdminSectionId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActiveSection = sections[active];

  const select = (id: AdminSectionId) => {
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-navy-50/40">
      <Sidebar
        active={active}
        onSelect={select}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="lg:pl-72">
        <Topbar section={active} onOpenMobile={() => setMobileOpen(true)} />
        <main className="px-4 py-6 sm:px-6">
          <ActiveSection />
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { WarehouseSectionId } from "@/lib/warehouse/types";
import {
  analytics,
  bookingRequests,
  chatThreads,
  currentSession,
  earnings,
  facilities,
  operator,
} from "@/lib/warehouse/data";
import { WarehouseSidebar } from "./WarehouseSidebar";
import { WarehouseTopbar } from "./WarehouseTopbar";
import { HomeSection } from "./sections/HomeSection";
import { FacilitiesSection } from "./sections/FacilitiesSection";
import { BookingsSection } from "./sections/BookingsSection";
import { EarningsSection } from "./sections/EarningsSection";
import { MessagesSection } from "./sections/MessagesSection";
import { ProfileSection } from "./sections/ProfileSection";

export function WarehouseDashboard() {
  const [active, setActive] = useState<WarehouseSectionId>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = currentSession;

  const select = (id: WarehouseSectionId) => {
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-navy-50/40">
      <WarehouseSidebar
        active={active}
        onSelect={select}
        displayName={operator.companyName ?? operator.fullName}
        verification={operator.verification}
        unread={chatThreads.reduce((sum, t) => sum + t.unread, 0)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64">
        <WarehouseTopbar
          section={active}
          onOpenMobile={() => setMobileOpen(true)}
          onViewPublic={() => window.open("/warehouses", "_blank")}
        />
        <main className="px-4 py-6 sm:px-6">
          {active === "home" && <HomeSection analytics={analytics} earnings={earnings} recentBookings={bookingRequests} />}
          {active === "facilities" && <FacilitiesSection session={session} seedFacilities={facilities} />}
          {active === "bookings" && <BookingsSection session={session} seedBookings={bookingRequests} />}
          {active === "earnings" && <EarningsSection earnings={earnings} />}
          {active === "messages" && <MessagesSection session={session} seedThreads={chatThreads} />}
          {active === "profile" && <ProfileSection session={session} profile={operator} />}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Availability, LogisticsSectionId } from "@/lib/logistics/types";
import {
  activeTrips,
  analytics,
  chatThreads,
  currentSession,
  earnings,
  freightOrders,
  provider,
  vehicles,
} from "@/lib/logistics/data";
import { LogisticsSidebar } from "./LogisticsSidebar";
import { LogisticsTopbar } from "./LogisticsTopbar";
import { HomeSection } from "./sections/HomeSection";
import { FleetSection } from "./sections/FleetSection";
import { JobsSection } from "./sections/JobsSection";
import { TripsSection } from "./sections/TripsSection";
import { EarningsSection } from "./sections/EarningsSection";
import { MessagesSection } from "./sections/MessagesSection";
import { ProfileSection } from "./sections/ProfileSection";

const AVAILABILITY_CYCLE: Availability[] = ["Available Now", "Busy", "Out of Service"];

export function LogisticsDashboard() {
  const [active, setActive] = useState<LogisticsSectionId>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [availability, setAvailability] = useState<Availability>(provider.availability);
  const session = currentSession;

  const select = (id: LogisticsSectionId) => {
    setActive(id);
    setMobileOpen(false);
  };

  const cycleAvailability = () =>
    setAvailability((cur) => {
      const idx = AVAILABILITY_CYCLE.indexOf(cur);
      return AVAILABILITY_CYCLE[(idx + 1) % AVAILABILITY_CYCLE.length];
    });

  return (
    <div className="min-h-screen bg-navy-50/40">
      <LogisticsSidebar
        active={active}
        onSelect={select}
        displayName={session.displayName}
        kind={session.kind}
        verification={provider.verification}
        availability={availability}
        unread={chatThreads.reduce((sum, t) => sum + t.unread, 0)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64">
        <LogisticsTopbar
          section={active}
          availability={availability}
          onCycleAvailability={cycleAvailability}
          onOpenMobile={() => setMobileOpen(true)}
          onViewPublic={() => window.open(`/transport/${session.providerId}`, "_blank")}
        />
        <main className="px-4 py-6 sm:px-6">
          {active === "home" && <HomeSection analytics={analytics} recentJobs={freightOrders} />}
          {active === "fleet" && <FleetSection session={session} seedVehicles={vehicles} />}
          {active === "jobs" && <JobsSection session={session} seedOrders={freightOrders} />}
          {active === "trips" && <TripsSection session={session} seedTrips={activeTrips} />}
          {active === "earnings" && <EarningsSection earnings={earnings} />}
          {active === "messages" && <MessagesSection session={session} seedThreads={chatThreads} />}
          {active === "profile" && <ProfileSection session={session} profile={{ ...provider, availability }} />}
        </main>
      </div>
    </div>
  );
}

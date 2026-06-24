"use client";

import { useEffect, useState } from "react";
import type { Availability, LogisticsSectionId } from "@/lib/logistics/types";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
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
import { LiveFleetSection } from "./sections/LiveFleetSection";
import { LiveTripsSection } from "./sections/LiveTripsSection";
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
  const [carrierId, setCarrierId] = useState<string | null>(null);
  const session = currentSession;

  // Resolve the live signed-in carrier id for fleet + shipments.
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const db = createClient();
    let mounted = true;
    db.auth.getUser().then(({ data }) => {
      if (mounted) setCarrierId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
          {active === "home" && (
            <div className="space-y-6">
              <LiveFleetSection carrierId={carrierId} />
              <LiveTripsSection carrierId={carrierId} />
              <HomeSection analytics={analytics} recentJobs={freightOrders} />
            </div>
          )}
          {active === "fleet" && (
            <div className="space-y-6">
              <LiveFleetSection carrierId={carrierId} />
              <FleetSection session={session} seedVehicles={vehicles} />
            </div>
          )}
          {active === "jobs" && <JobsSection session={session} seedOrders={freightOrders} />}
          {active === "trips" && (
            <div className="space-y-6">
              <LiveTripsSection carrierId={carrierId} />
              <TripsSection session={session} seedTrips={activeTrips} />
            </div>
          )}
          {active === "earnings" && <EarningsSection earnings={earnings} />}
          {active === "messages" && <MessagesSection session={session} seedThreads={chatThreads} />}
          {active === "profile" && <ProfileSection session={session} profile={{ ...provider, availability }} />}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { SupplierSectionId } from "@/lib/supplier/types";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import {
  analytics,
  chatThreads,
  currentSession,
  incomingRequests,
  products,
  reviews,
  supplierProfile,
} from "@/lib/supplier/data";
import { SupplierSidebar } from "./SupplierSidebar";
import { SupplierTopbar } from "./SupplierTopbar";
import { HomeSection } from "./sections/HomeSection";
import { SupplierHomeSection } from "./sections/SupplierHomeSection";
import { CatalogSection } from "./sections/CatalogSection";
import { LiveCatalogSection } from "./sections/LiveCatalogSection";
import { RfqSection } from "./sections/RfqSection";
import { LivePipelineSection } from "./sections/LivePipelineSection";
import { MessagesSection } from "./sections/MessagesSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { ProfileSection } from "./sections/ProfileSection";

export function SupplierDashboard() {
  const [active, setActive] = useState<SupplierSectionId>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const session = currentSession;

  // Resolve the live signed-in supplier id for catalog + metrics.
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const db = createClient();
    let mounted = true;
    db.auth.getUser().then(({ data }) => {
      if (mounted) setSupplierId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const select = (id: SupplierSectionId) => {
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-navy-50/40">
      <SupplierSidebar
        active={active}
        onSelect={select}
        companyName={session.companyName}
        verification={supplierProfile.verification}
        unread={analytics.unreadMessages}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64">
        <SupplierTopbar
          section={active}
          onOpenMobile={() => setMobileOpen(true)}
          onViewStorefront={() => window.open(`/suppliers/${session.supplierId}`, "_blank")}
        />
        <main className="px-4 py-6 sm:px-6">
          {active === "home" && (
            <div className="space-y-6">
              <SupplierHomeSection supplierId={supplierId} />
              <HomeSection analytics={analytics} recentRequests={incomingRequests} />
            </div>
          )}
          {active === "catalog" && (
            <div className="space-y-6">
              <LiveCatalogSection supplierId={supplierId} />
              <CatalogSection session={session} seedProducts={products} />
            </div>
          )}
          {active === "rfq" && (
            <div className="space-y-6">
              <LivePipelineSection />
              <RfqSection session={session} seedRequests={incomingRequests} />
            </div>
          )}
          {active === "messages" && <MessagesSection session={session} seedThreads={chatThreads} />}
          {active === "reviews" && <ReviewsSection session={session} profile={supplierProfile} seedReviews={reviews} />}
          {active === "profile" && <ProfileSection session={session} profile={supplierProfile} />}
        </main>
      </div>
    </div>
  );
}

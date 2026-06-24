"use client";

import { useState } from "react";
import type { SupplierSectionId } from "@/lib/supplier/types";
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
import { CatalogSection } from "./sections/CatalogSection";
import { RfqSection } from "./sections/RfqSection";
import { LivePipelineSection } from "./sections/LivePipelineSection";
import { MessagesSection } from "./sections/MessagesSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { ProfileSection } from "./sections/ProfileSection";

export function SupplierDashboard() {
  const [active, setActive] = useState<SupplierSectionId>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = currentSession;

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
          {active === "home" && <HomeSection analytics={analytics} recentRequests={incomingRequests} />}
          {active === "catalog" && <CatalogSection session={session} seedProducts={products} />}
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

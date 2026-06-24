"use client";

import { useState } from "react";
import type {
  CoreSectionId,
  CurrencyCode,
  LocaleCode,
} from "@/lib/core/types";
import { CoreSidebar } from "./CoreSidebar";
import { CoreTopbar } from "./CoreTopbar";
import { WorkspaceSection } from "./sections/WorkspaceSection";
import { SearchSection } from "./sections/SearchSection";
import { EscrowSection } from "./sections/EscrowSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { DisputesSection } from "./sections/DisputesSection";
import { SupportSection } from "./sections/SupportSection";
import { AuditSection } from "./sections/AuditSection";
import { FraudSection } from "./sections/FraudSection";
import { RbacSection } from "./sections/RbacSection";
import { BiSection } from "./sections/BiSection";

export function CoreDashboard() {
  const [active, setActive] = useState<CoreSectionId>("workspace");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const select = (id: CoreSectionId) => {
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-navy-50/40">
      <CoreSidebar active={active} onSelect={select} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <CoreTopbar
          section={active}
          locale={locale}
          currency={currency}
          onLocale={setLocale}
          onCurrency={setCurrency}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6">
          {active === "workspace" && <WorkspaceSection currency={currency} />}
          {active === "search" && <SearchSection />}
          {active === "escrow" && <EscrowSection currency={currency} />}
          {active === "documents" && <DocumentsSection />}
          {active === "disputes" && <DisputesSection currency={currency} />}
          {active === "support" && <SupportSection />}
          {active === "audit" && <AuditSection />}
          {active === "fraud" && <FraudSection />}
          {active === "rbac" && <RbacSection />}
          {active === "bi" && <BiSection currency={currency} />}
        </main>
      </div>
    </div>
  );
}

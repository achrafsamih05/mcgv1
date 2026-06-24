import type { ImporterSectionId } from "@/lib/importer/types";

export type ImporterNavItem = {
  id: ImporterSectionId;
  label: string;
  icon: string;
};

export const importerNav: ImporterNavItem[] = [
  { id: "home", label: "Command Center", icon: "LayoutDashboard" },
  { id: "sourcing", label: "Sourcing Search", icon: "Search" },
  { id: "rfqs", label: "My RFQs", icon: "FileText" },
  { id: "quotations", label: "Quotations", icon: "GitCompare" },
  { id: "tracking", label: "Shipment Tracking", icon: "Radar" },
  { id: "logistics", label: "Logistics", icon: "Truck" },
  { id: "feedback", label: "Feedback", icon: "Star" },
  { id: "profile", label: "Profile", icon: "UserCog" },
];

export const importerSectionMeta: Record<
  ImporterSectionId,
  { title: string; subtitle: string }
> = {
  home: { title: "Command Center", subtitle: "Your sourcing workspace at a glance" },
  sourcing: { title: "Cross-Border Sourcing", subtitle: "Discover products & suppliers" },
  rfqs: { title: "Sourcing Requests", subtitle: "Manage your RFQs" },
  quotations: { title: "Quotation Auditing", subtitle: "Compare and execute supplier offers" },
  tracking: { title: "Shipment Tracking", subtitle: "End-to-end cargo visibility" },
  logistics: { title: "Logistics Sourcing", subtitle: "Warehouses & transport booking" },
  feedback: { title: "Tri-Party Feedback", subtitle: "Rate suppliers, fleet & warehouses" },
  profile: { title: "Business Profile", subtitle: "Your importer account" },
};

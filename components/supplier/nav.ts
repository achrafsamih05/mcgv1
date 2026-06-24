import type { SupplierSectionId } from "@/lib/supplier/types";

export type SupplierNavItem = {
  id: SupplierSectionId;
  label: string;
  icon: string;
};

export const supplierNav: SupplierNavItem[] = [
  { id: "home", label: "Command Center", icon: "LayoutDashboard" },
  { id: "catalog", label: "Product Catalog", icon: "Package" },
  { id: "rfq", label: "RFQ / Requests", icon: "Inbox" },
  { id: "messages", label: "Messages", icon: "MessageSquare" },
  { id: "reviews", label: "Reviews", icon: "Star" },
  { id: "profile", label: "Company Profile", icon: "Building2" },
];

export const supplierSectionMeta: Record<
  SupplierSectionId,
  { title: string; subtitle: string }
> = {
  home: { title: "Command Center", subtitle: "Your storefront at a glance" },
  catalog: { title: "Product Catalog", subtitle: "Manage your B2B listings" },
  rfq: { title: "RFQ / Incoming Requests", subtitle: "Respond to buyer quote requests" },
  messages: { title: "Messaging Center", subtitle: "Secure conversations with buyers" },
  reviews: { title: "Reviews & Verification", subtitle: "Buyer feedback and trust status" },
  profile: { title: "Company Profile", subtitle: "Your public storefront details" },
};

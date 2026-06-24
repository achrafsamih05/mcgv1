import type { AdminSectionId } from "@/lib/admin/types";

export type NavItem = {
  id: AdminSectionId;
  label: string;
  icon: string; // lucide icon name resolved in Sidebar
  group: "Overview" | "Verification" | "Operations" | "Trust & Safety" | "Platform";
};

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", group: "Overview" },
  { id: "users", label: "User Directory", icon: "Users", group: "Overview" },

  { id: "suppliers", label: "Supplier Verification", icon: "BadgeCheck", group: "Verification" },
  { id: "drivers", label: "Drivers & Fleet", icon: "Truck", group: "Verification" },
  { id: "warehouses", label: "Warehouse Approvals", icon: "Warehouse", group: "Verification" },

  { id: "products", label: "Product Moderation", icon: "Package", group: "Operations" },
  { id: "orders", label: "Import Orders", icon: "ClipboardList", group: "Operations" },
  { id: "deals", label: "Deals & Escrow", icon: "Handshake", group: "Operations" },
  { id: "tracking", label: "Global Tracking", icon: "Radar", group: "Operations" },

  { id: "disputes", label: "Dispute Center", icon: "Scale", group: "Trust & Safety" },
  { id: "moderation", label: "Message Moderation", icon: "MessageSquareWarning", group: "Trust & Safety" },
  { id: "reviews", label: "Reviews & Ratings", icon: "Star", group: "Trust & Safety" },

  { id: "broadcast", label: "Broadcast Engine", icon: "Megaphone", group: "Platform" },
  { id: "finance", label: "Financial Management", icon: "Wallet", group: "Platform" },
  { id: "cms", label: "CMS Dashboard", icon: "FileText", group: "Platform" },
  { id: "audit", label: "Audit Trail", icon: "ShieldCheck", group: "Platform" },
  { id: "settings", label: "Settings & BI", icon: "Settings", group: "Platform" },
];

export const sectionTitles: Record<AdminSectionId, { title: string; subtitle: string }> = {
  dashboard: { title: "Central Command Center", subtitle: "Real-time ecosystem overview" },
  users: { title: "User Directory & Management", subtitle: "Full control over every account" },
  suppliers: { title: "Supplier Verification Pipeline", subtitle: "KYC review & badging" },
  drivers: { title: "Drivers & Fleet Verification", subtitle: "License, permit & ownership checks" },
  warehouses: { title: "Warehouse Solutions Approvals", subtitle: "Facility verification & pricing" },
  products: { title: "Product Catalogue Moderation", subtitle: "Platform-wide listing control" },
  orders: { title: "Import Order Lifecycle", subtitle: "Pipeline routing & overrides" },
  deals: { title: "Deal Flow & Escrow", subtitle: "Contracts & monetary mediation" },
  tracking: { title: "Universal Global Tracking", subtitle: "CEO status override console" },
  disputes: { title: "Dispute Resolution Center", subtitle: "Tri-party mediation & verdicts" },
  moderation: { title: "Content & Messaging Moderation", subtitle: "Flagged message queue" },
  broadcast: { title: "Mass Broadcast & Notifications", subtitle: "Targeted platform messaging" },
  finance: { title: "Financial & Revenue Management", subtitle: "Commissions, payouts & profit" },
  cms: { title: "Content Management System", subtitle: "Public site content control" },
  reviews: { title: "Reviews & Ratings Moderation", subtitle: "Audit & remove fraudulent feedback" },
  audit: { title: "Immutable Activity Log", subtitle: "Chronological audit trail" },
  settings: { title: "Global Settings & BI", subtitle: "Config, security & strategic analytics" },
};

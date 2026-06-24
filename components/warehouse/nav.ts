import type { WarehouseSectionId } from "@/lib/warehouse/types";

export type WarehouseNavItem = {
  id: WarehouseSectionId;
  label: string;
  icon: string;
};

export const warehouseNav: WarehouseNavItem[] = [
  { id: "home", label: "Command Center", icon: "LayoutDashboard" },
  { id: "facilities", label: "My Warehouses", icon: "Warehouse" },
  { id: "bookings", label: "Booking Requests", icon: "ClipboardList" },
  { id: "earnings", label: "Financials", icon: "Wallet" },
  { id: "messages", label: "Messages", icon: "MessageSquare" },
  { id: "profile", label: "Profile", icon: "UserCog" },
];

export const warehouseSectionMeta: Record<
  WarehouseSectionId,
  { title: string; subtitle: string }
> = {
  home: { title: "Command Center", subtitle: "Operational metrics & financials" },
  facilities: { title: "Warehouse Facilities", subtitle: "Manage your listings & pricing" },
  bookings: { title: "Booking Requests", subtitle: "Process incoming RFQs" },
  earnings: { title: "Financial Analytics", subtitle: "Earnings across all facilities" },
  messages: { title: "B2B Chat Matrix", subtitle: "Conversations with clients" },
  profile: { title: "Operator Profile", subtitle: "Identity & compliance vault" },
};

import type { LogisticsSectionId } from "@/lib/logistics/types";

export type LogisticsNavItem = {
  id: LogisticsSectionId;
  label: string;
  icon: string;
};

export const logisticsNav: LogisticsNavItem[] = [
  { id: "home", label: "Command Center", icon: "LayoutDashboard" },
  { id: "fleet", label: "Fleet Manager", icon: "Truck" },
  { id: "jobs", label: "Job Offers", icon: "PackageSearch" },
  { id: "trips", label: "Active Trips", icon: "Route" },
  { id: "earnings", label: "Earnings", icon: "Wallet" },
  { id: "messages", label: "Messages", icon: "MessageSquare" },
  { id: "profile", label: "Profile", icon: "UserCog" },
];

export const logisticsSectionMeta: Record<
  LogisticsSectionId,
  { title: string; subtitle: string }
> = {
  home: { title: "Command Center", subtitle: "Your operational cockpit" },
  fleet: { title: "Fleet & Vehicle Manager", subtitle: "Manage your vehicle inventory" },
  jobs: { title: "Logistics Job Offers", subtitle: "Incoming freight requests & quoting" },
  trips: { title: "Active Trips", subtitle: "Live multi-state trip tracking" },
  earnings: { title: "Financial Ledger", subtitle: "Earnings architecture matrix" },
  messages: { title: "Communication Center", subtitle: "Clients & platform support" },
  profile: { title: "Profile & Availability", subtitle: "Your public logistics gateway" },
};

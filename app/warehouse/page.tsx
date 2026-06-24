import type { Metadata } from "next";
import { WarehouseDashboard } from "@/components/warehouse/WarehouseDashboard";

export const metadata: Metadata = {
  title: "Operator Console",
  description: "MCG Global warehouse dashboard — facilities, bookings and financials.",
  robots: { index: false, follow: false },
};

export default function WarehouseConsolePage() {
  return <WarehouseDashboard />;
}

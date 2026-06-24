import type { Metadata } from "next";
import { LogisticsDashboard } from "@/components/logistics/LogisticsDashboard";

export const metadata: Metadata = {
  title: "Driver Console",
  description: "MCG Global logistics dashboard — fleet, jobs, trips and earnings.",
  robots: { index: false, follow: false },
};

export default function LogisticsConsolePage() {
  return <LogisticsDashboard />;
}

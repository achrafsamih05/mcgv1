import type { Metadata } from "next";
import { CoreDashboard } from "@/components/core/CoreDashboard";

export const metadata: Metadata = {
  title: "Core Platform Services",
  description: "MCG Global shared core — workspace, escrow, disputes, audit, RBAC and CEO BI.",
  robots: { index: false, follow: false },
};

export default function CorePage() {
  return <CoreDashboard />;
}

import type { Metadata } from "next";
import { ImporterDashboard } from "@/components/importer/ImporterDashboard";

export const metadata: Metadata = {
  title: "Importer Command Center",
  description: "MCG Global buyer dashboard — sourcing, RFQs, quotations, tracking and logistics.",
  robots: { index: false, follow: false },
};

export default function ImporterConsolePage() {
  return <ImporterDashboard />;
}

import type { Metadata } from "next";
import { SupplierDashboard } from "@/components/supplier/SupplierDashboard";

export const metadata: Metadata = {
  title: "Seller Console",
  description: "MCG Global supplier dashboard — manage your storefront, catalog and RFQs.",
  robots: { index: false, follow: false },
};

export default function SupplierConsolePage() {
  return <SupplierDashboard />;
}

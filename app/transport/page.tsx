import type { Metadata } from "next";
import { BuyerSearch } from "@/components/logistics/BuyerSearch";
import { publicProviders } from "@/lib/logistics/data";

export const metadata: Metadata = {
  title: "Find Transport & Drivers",
  description: "Search verified transport companies and independent drivers on MCG Global.",
};

export default function TransportSearchPage() {
  return (
    <main className="min-h-screen bg-navy-50/40">
      <BuyerSearch providers={publicProviders} />
    </main>
  );
}

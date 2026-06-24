import type { Metadata } from "next";
import { BuyerSearch } from "@/components/warehouse/BuyerSearch";
import { publicFacilities } from "@/lib/warehouse/data";

export const metadata: Metadata = {
  title: "Find Warehouse Space",
  description: "Search verified storage facilities on MCG Global.",
};

export default function WarehousesSearchPage() {
  return (
    <main className="min-h-screen bg-navy-50/40">
      <BuyerSearch facilities={publicFacilities} />
    </main>
  );
}

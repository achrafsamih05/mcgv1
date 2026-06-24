import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicStorefront } from "@/components/warehouse/PublicStorefront";
import { publicFacilities } from "@/lib/warehouse/data";

/**
 * Public warehouse storefront. Only PUBLIC facility fields are exposed — no
 * operator revenue, client requests, or cross-tenant listings reach this page.
 */
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const f = publicFacilities.find((x) => x.id === params.id);
  return f
    ? { title: `${f.name} — ${f.city}`, description: `${f.category} warehouse, ${f.availableSqm} sqm available.` }
    : { title: "Warehouse" };
}

export default function WarehouseStorefrontPage({ params }: { params: { id: string } }) {
  const facility = publicFacilities.find((x) => x.id === params.id);
  if (!facility) notFound();
  return <PublicStorefront facility={facility} />;
}

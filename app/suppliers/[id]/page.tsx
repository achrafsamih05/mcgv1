import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicStorefront } from "@/components/supplier/PublicStorefront";
import { products, supplierProfile } from "@/lib/supplier/data";

/**
 * Public supplier storefront. In production this fetches by id from the API.
 * Only PUBLIC, non-sensitive fields are exposed here — no RFQs, chats, or
 * cross-tenant data ever reach this page.
 */
export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  if (params.id !== supplierProfile.id) {
    return { title: "Supplier" };
  }
  return {
    title: `${supplierProfile.companyName} — Verified Supplier`,
    description: supplierProfile.description,
  };
}

export default function SupplierStorefrontPage({
  params,
}: {
  params: { id: string };
}) {
  // Demo: only one supplier exists in the mock layer.
  if (params.id !== supplierProfile.id) {
    notFound();
  }

  const liveProducts = products.filter(
    (p) => p.supplierId === supplierProfile.id && p.status === "Live"
  );

  return (
    <PublicStorefront
      profile={supplierProfile}
      liveProducts={liveProducts}
      completedOrders={342}
    />
  );
}

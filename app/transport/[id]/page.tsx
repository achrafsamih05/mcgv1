import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/logistics/PublicProfile";
import { publicProviders, vehicles } from "@/lib/logistics/data";

/**
 * Public transport provider profile. Only PUBLIC fields are exposed — no
 * allocated orders, trips, earnings, or chats ever reach this page.
 */
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = publicProviders.find((x) => x.id === params.id);
  return p
    ? { title: `${p.displayName} — ${p.kind}`, description: p.description }
    : { title: "Transport Provider" };
}

export default function TransportProfilePage({ params }: { params: { id: string } }) {
  const provider = publicProviders.find((x) => x.id === params.id);
  if (!provider) notFound();

  // Only show this provider's own public fleet.
  const fleet = vehicles.filter((v) => v.providerId === provider.id);

  return <PublicProfile provider={provider} fleet={fleet} />;
}

"use client";

import { Building2, Loader2, MapPin } from "lucide-react";
import { content, whatsappLink } from "@/lib/content";
import { suppliers as seedSuppliers } from "@/lib/data";
import { fetchApprovedSuppliers } from "@/lib/supabase/queries";
import { useRealtimeQuery } from "@/lib/supabase/useRealtime";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/database.types";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";

/** Unified card view-model so seed showcase + live rows render identically. */
type SupplierCard = {
  id: string;
  name: string;
  country: string;
  specialization: string;
  rating: number;
  reviews: number;
  years: string;
  live: boolean;
};

export function Suppliers() {
  const t = content.en.suppliers;

  // Loop A — live, APPROVED-only suppliers. Newly approved accounts appear here
  // automatically via the realtime `profiles` channel.
  const { data: live, loading, error } = useRealtimeQuery<Profile[]>(
    "profiles",
    fetchApprovedSuppliers,
    []
  );

  const seedCards: SupplierCard[] = seedSuppliers.map((s) => ({
    id: s.id,
    name: s.name,
    country: s.country,
    specialization: s.specialization,
    rating: s.rating,
    reviews: s.reviews,
    years: `${s.years} ${t.experience}`,
    live: false,
  }));

  const liveCards: SupplierCard[] = live.map((p) => ({
    id: p.id,
    name: p.company_name || p.full_name || "Verified Supplier",
    country: "—",
    specialization: "Verified supplier on MCG Global",
    rating: 5,
    reviews: 0,
    years: "Newly verified",
    live: true,
  }));

  // When the backend is connected, lead with live approved suppliers and use
  // the curated seed only to keep the showcase visually full.
  const cards: SupplierCard[] = SUPABASE_CONFIGURED
    ? [...liveCards, ...seedCards].slice(0, 8)
    : seedCards;

  return (
    <Section id="suppliers" className="bg-white">
      <Reveal>
        <SectionHeader title={t.title} description={t.description} />
      </Reveal>

      {SUPABASE_CONFIGURED && loading && live.length === 0 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-navy-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading verified suppliers…
        </div>
      )}
      {SUPABASE_CONFIGURED && error && (
        <p role="alert" className="mt-6 text-center text-sm text-red-600">
          Verified suppliers could not be loaded right now.
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05}>
            <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-navy-900">
                    {s.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-navy-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {s.country}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-navy-700">
                {s.specialization}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Stars rating={s.rating} />
                <span className="text-xs font-medium text-navy-500">
                  {s.rating.toFixed(1)} ({s.reviews.toLocaleString("en-US")})
                </span>
              </div>

              <p className="mt-2 text-xs text-navy-500">{s.years}</p>

              <div className="mt-5 flex gap-2 pt-1">
                <button
                  type="button"
                  className="flex-1 cursor-pointer rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-navy-800"
                >
                  {t.viewProfile}
                </button>
                <a
                  href={whatsappLink(`Hello, I'm interested in ${s.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 cursor-pointer rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 text-center text-xs font-semibold text-accent-700 transition-colors duration-200 hover:bg-accent-100"
                >
                  {t.contact}
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

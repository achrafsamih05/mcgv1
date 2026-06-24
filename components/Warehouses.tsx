"use client";

import Image from "next/image";
import { Loader2, Maximize, MapPin, Tag, Warehouse as WarehouseIcon } from "lucide-react";
import { content } from "@/lib/content";
import { warehouses as seedWarehouses } from "@/lib/data";
import { fetchApprovedWarehouses } from "@/lib/supabase/queries";
import { useRealtimeQuery } from "@/lib/supabase/useRealtime";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import type { WarehouseWithHost } from "@/lib/supabase/database.types";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Warehouses() {
  const t = content.en.warehouses;

  // Loop A — live, APPROVED-only warehouses (relational join on host status).
  const { data: live, loading, error } = useRealtimeQuery<WarehouseWithHost[]>(
    "warehouses",
    fetchApprovedWarehouses,
    []
  );

  return (
    <Section id="warehouses">
      <Reveal>
        <SectionHeader title={t.title} description={t.description} />
      </Reveal>

      {SUPABASE_CONFIGURED && loading && live.length === 0 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-navy-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading available warehouses…
        </div>
      )}
      {SUPABASE_CONFIGURED && error && (
        <p role="alert" className="mt-6 text-center text-sm text-red-600">
          Warehouse listings could not be loaded right now.
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Live, backend-approved warehouses lead the grid when present. */}
        {SUPABASE_CONFIGURED &&
          live.map((w, i) => (
            <Reveal key={w.id} delay={i * 0.05}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700">
                  <WarehouseIcon className="h-12 w-12 text-accent-500" aria-hidden="true" />
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    Verified
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="flex items-center gap-1.5 text-lg font-semibold text-navy-900">
                    <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />
                    {w.title}
                  </h3>
                  <dl className="mt-3 space-y-1.5 text-sm text-navy-600">
                    <div className="flex items-center gap-1.5">
                      <Maximize className="h-4 w-4 text-navy-400" aria-hidden="true" />
                      <dt className="sr-only">Storage area</dt>
                      <dd>
                        {w.available_area_m2 != null ? `${w.available_area_m2.toLocaleString()} m² available` : w.city || "—"}
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-navy-400" aria-hidden="true" />
                      <dt className="sr-only">Pricing</dt>
                      <dd className="font-medium text-navy-800">
                        {w.price_per_m2_monthly != null ? `From $${w.price_per_m2_monthly} / m² monthly` : "Contact for pricing"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex gap-2 pt-1">
                    <button type="button" className="flex-1 cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-50">
                      {t.view}
                    </button>
                    <button type="button" className="flex-1 cursor-pointer rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
                      {t.book}
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

        {/* Curated showcase keeps the section visually complete. */}
        {seedWarehouses.map((w, i) => (
          <Reveal key={w.id} delay={(live.length + i) * 0.05}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={w.image}
                  alt={`Warehouse facility in ${w.city}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                    w.status === "Available" ? "bg-emerald-500 text-white" : "bg-accent-500 text-white"
                  }`}
                >
                  {w.status}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="flex items-center gap-1.5 text-lg font-semibold text-navy-900">
                  <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />
                  {w.city}
                </h3>

                <dl className="mt-3 space-y-1.5 text-sm text-navy-600">
                  <div className="flex items-center gap-1.5">
                    <Maximize className="h-4 w-4 text-navy-400" aria-hidden="true" />
                    <dt className="sr-only">Storage area</dt>
                    <dd>{w.area}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-navy-400" aria-hidden="true" />
                    <dt className="sr-only">Pricing</dt>
                    <dd className="font-medium text-navy-800">{w.pricing}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex gap-2 pt-1">
                  <button type="button" className="flex-1 cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-50">
                    {t.view}
                  </button>
                  <button type="button" className="flex-1 cursor-pointer rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
                    {t.book}
                  </button>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

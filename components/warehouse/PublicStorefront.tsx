"use client";

import {
  Check,
  ImageIcon,
  Mail,
  MapPin,
  Maximize,
  MessageSquare,
  Ruler,
} from "lucide-react";
import type { WarehouseFacility } from "@/lib/warehouse/types";
import { whatsappLink } from "@/lib/content";
import { AvailabilityBadge, Badge, Button, Panel, Stars, VerificationBadge } from "./ui";
import { WhatsAppIcon } from "@/components/ui/icons";

type PublicFacility = WarehouseFacility & { operatorName: string; rating: number };

export function PublicStorefront({ facility }: { facility: PublicFacility }) {
  const occupancy = Math.round(((facility.totalAreaSqm - facility.availableSqm) / facility.totalAreaSqm) * 100);
  const tiers: { label: string; value: number }[] = [
    { label: "Daily", value: facility.pricing.daily },
    { label: "Weekly", value: facility.pricing.weekly },
    { label: "Monthly", value: facility.pricing.monthly },
    { label: "Annual", value: facility.pricing.annual },
  ];

  return (
    <div className="min-h-screen bg-navy-50/40 pb-16">
      {/* Media carousel placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-navy-800 to-navy-950 sm:h-80">
        <div className="flex h-full items-center justify-center text-white/20">
          <ImageIcon className="h-12 w-12" aria-hidden="true" />
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: Math.min(5, facility.imageCount || 1) }).map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === 0 ? "bg-accent-500" : "bg-white/40"}`} />
          ))}
        </div>
      </div>

      <div className="container-page -mt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="space-y-6">
            <Panel className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-navy-900">{facility.name}</h1>
                <VerificationBadge state={facility.verification} />
                <AvailabilityBadge status={facility.availability} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
                <MapPin className="h-4 w-4" aria-hidden="true" />{facility.address}, {facility.city}, {facility.country}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Badge tone="neutral">{facility.category}</Badge>
                <span className="flex items-center gap-1.5"><Stars rating={facility.rating} size={14} /><span className="text-xs text-navy-500">{facility.rating.toFixed(1)}</span></span>
                <span className="text-xs text-navy-500">by {facility.operatorName}</span>
              </div>
            </Panel>

            {/* Structural specs */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4"><h2 className="text-base font-semibold text-navy-900">Structural Specifications</h2></div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                <Spec icon={<Maximize className="h-4 w-4" />} label="Total Area" value={`${facility.totalAreaSqm.toLocaleString()} sqm`} />
                <Spec icon={<Maximize className="h-4 w-4" />} label="Available" value={`${facility.availableSqm.toLocaleString()} sqm`} accent />
                <Spec icon={<Ruler className="h-4 w-4" />} label="Clearance" value={`${facility.clearanceHeightM} m`} />
                <Spec label="Floors" value={facility.floors.toString()} />
                <Spec label="Floor Type" value={facility.floorType} />
                <Spec label="Occupancy" value={`${occupancy}%`} />
              </div>
            </Panel>

            {/* Pricing tiers */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4"><h2 className="text-base font-semibold text-navy-900">Pricing Tiers ($/sqm)</h2></div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                {tiers.map((t) => (
                  <div key={t.label} className="rounded-lg border border-navy-100 p-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-navy-500">{t.label}</p>
                    <p className="mt-1 text-lg font-bold text-accent-600">${t.value}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Add-on services */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4"><h2 className="text-base font-semibold text-navy-900">Available Add-on Services</h2></div>
              <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2">
                {facility.services.map((s) => (
                  <div key={s.key} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${s.enabled ? "border-emerald-200 bg-emerald-50" : "border-navy-100 bg-navy-50/50 opacity-60"}`}>
                    <span className="flex items-center gap-2 text-navy-800">
                      {s.enabled && <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
                      {s.label}
                    </span>
                    {s.enabled && s.price > 0 && <span className="font-semibold text-navy-900">${s.price}</span>}
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Lead gen panel */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <Panel className="p-5">
              <p className="text-sm text-navy-500">Starting from</p>
              <p className="text-2xl font-bold text-accent-600">${facility.pricing.monthly}<span className="text-sm font-medium text-navy-500">/sqm/mo</span></p>
              <div className="mt-4 space-y-2.5">
                <button type="button" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
                  Book Now
                </button>
                <button type="button" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-50">
                  Request Custom Quote
                </button>
                <a href={whatsappLink(`Hello, I'm interested in ${facility.name}.`)} target="_blank" rel="noopener noreferrer" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-whatsapp-dark">
                  <WhatsAppIcon className="h-5 w-5" />WhatsApp
                </a>
                <button type="button" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-50">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />Message Owner
                </button>
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value, accent }: { icon?: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-navy-50 p-3">
      <p className="flex items-center gap-1 text-xs text-navy-500">{icon}{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${accent ? "text-accent-600" : "text-navy-900"}`}>{value}</p>
    </div>
  );
}

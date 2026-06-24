"use client";

import {
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Users,
} from "lucide-react";
import type { B2BProduct, SupplierProfile } from "@/lib/supplier/types";
import { whatsappLink } from "@/lib/content";
import { Badge, Panel, Stars, VerificationBadge } from "./ui";
import { WhatsAppIcon } from "@/components/ui/icons";

export function PublicStorefront({
  profile,
  liveProducts,
  completedOrders,
}: {
  profile: SupplierProfile;
  liveProducts: B2BProduct[];
  completedOrders: number;
}) {
  return (
    <div className="min-h-screen bg-navy-50/40 pb-16">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-navy-800 to-navy-950 sm:h-60">
        <div className="container-page flex h-full items-end">
          <div className="absolute -bottom-10 flex items-end gap-4">
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-accent-500 text-white shadow-lg">
              <Building2 className="h-10 w-10" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>

      <div className="container-page">
        {/* Header */}
        <div className="mt-14 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">{profile.companyName}</h1>
              <VerificationBadge state={profile.verification} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {profile.city}, {profile.country} · {profile.businessType} · Est. {profile.yearEstablished}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-600">{profile.description}</p>
          </div>
        </div>

        {/* Performance ribbon */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
          <RibbonStat icon={<Package className="h-5 w-5" />} value={liveProducts.length.toString()} label="Active Products" />
          <RibbonStat icon={<CheckCircle2 className="h-5 w-5" />} value={completedOrders.toString()} label="Completed Orders" />
          <RibbonStat icon={<Users className="h-5 w-5" />} value={profile.rating.toFixed(1)} label="Avg Rating" rating={profile.rating} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Products */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4">
                <h2 className="text-base font-semibold text-navy-900">Products</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                {liveProducts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-navy-100 p-4 transition-shadow duration-200 hover:shadow-md">
                    <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-navy-100 text-navy-300">
                      <Package className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <Badge tone="neutral">{p.category}</Badge>
                    <h3 className="mt-2 font-semibold text-navy-900">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-navy-500">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-accent-600">${p.priceMin}–${p.priceMax}</span>
                      <span className="text-xs text-navy-500">MOQ {p.moq.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Credentials vault */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4">
                <h2 className="text-base font-semibold text-navy-900">Credentials</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                {profile.credentials.map((c) => (
                  <div key={c.id} className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-2 text-xs font-semibold text-navy-900">{c.name}</p>
                    <p className="text-[11px] text-navy-500">{c.type}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Lead generation floating panel */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <Panel className="p-5">
              <h2 className="text-base font-semibold text-navy-900">Contact Supplier</h2>
              <p className="mt-1 text-sm text-navy-500">Get a quote or start a conversation.</p>
              <div className="mt-4 space-y-2.5">
                <a
                  href={whatsappLink(`Hello ${profile.companyName}, I'd like a quote.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-whatsapp-dark"
                >
                  <WhatsAppIcon className="h-5 w-5" />Contact via WhatsApp
                </a>
                <a
                  href={`mailto:${profile.businessEmail}`}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-50"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />Email Inquiry
                </a>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />Send Message
                </button>
              </div>

              <dl className="mt-5 space-y-2 border-t border-navy-100 pt-4 text-sm">
                <div className="flex items-center gap-2 text-navy-600">
                  <Users className="h-4 w-4 text-navy-400" aria-hidden="true" />{profile.totalEmployees} employees
                </div>
                {profile.website && (
                  <div className="flex items-center gap-2 text-navy-600">
                    <Globe className="h-4 w-4 text-navy-400" aria-hidden="true" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-navy-600">
                  <Stars rating={profile.rating} size={14} />
                  <span className="text-xs">({profile.reviewCount})</span>
                </div>
              </dl>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RibbonStat({
  icon,
  value,
  label,
  rating,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  rating?: number;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3 text-center shadow-sm">
      <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">{icon}</span>
      <p className="mt-2 text-lg font-bold text-navy-900">{value}</p>
      {rating !== undefined ? (
        <div className="mt-0.5 flex justify-center"><Stars rating={rating} size={12} /></div>
      ) : null}
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy-500">{label}</p>
    </div>
  );
}

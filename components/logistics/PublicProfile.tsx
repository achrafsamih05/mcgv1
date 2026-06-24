"use client";

import {
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Truck,
  User,
  Users,
} from "lucide-react";
import type { LogisticsProvider, VehicleAsset } from "@/lib/logistics/types";
import { whatsappLink } from "@/lib/content";
import { AvailabilityBadge, Badge, Panel, Stars, VerificationBadge } from "./ui";
import { WhatsAppIcon } from "@/components/ui/icons";

export function PublicProfile({
  provider,
  fleet,
}: {
  provider: LogisticsProvider;
  fleet: VehicleAsset[];
}) {
  const isCompany = provider.kind === "Transport Company";

  return (
    <div className="min-h-screen bg-navy-50/40 pb-16">
      <div className="relative h-44 bg-gradient-to-br from-navy-800 to-navy-950 sm:h-56">
        <div className="container-page relative flex h-full items-end">
          <span className="absolute -bottom-9 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-accent-500 text-white shadow-lg">
            {isCompany ? <Building2 className="h-9 w-9" aria-hidden="true" /> : <User className="h-9 w-9" aria-hidden="true" />}
          </span>
        </div>
      </div>

      <div className="container-page">
        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-900">{provider.displayName}</h1>
              <VerificationBadge state={provider.verification} kind={provider.kind} />
              <AvailabilityBadge status={provider.availability} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />{provider.city}, {provider.country} · {provider.kind}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-600">{provider.description}</p>
          </div>
        </div>

        {/* Reputation ledger */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
          <RibbonStat icon={<Users className="h-5 w-5" />} value={provider.clientsServed.toString()} label="Clients Served" />
          <RibbonStat icon={<CheckCircle2 className="h-5 w-5" />} value={provider.completedTrips.toString()} label="Completed Trips" />
          <RibbonStat icon={<Truck className="h-5 w-5" />} value={provider.rating.toFixed(1)} label="Avg Rating" rating={provider.rating} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {/* Fleet */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4">
                <h2 className="text-base font-semibold text-navy-900">Fleet</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                {fleet.map((v) => (
                  <div key={v.id} className="rounded-xl border border-navy-100 p-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-navy-900">
                        <Truck className="h-4 w-4 text-accent-500" aria-hidden="true" />{v.class}{v.truckType ? ` · ${v.truckType}` : ""}
                      </span>
                      <Badge tone={v.available ? "success" : "neutral"}>{v.available ? "Available" : "Busy"}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-navy-500">Max payload: <span className="font-semibold text-navy-800">{v.maxPayloadKg.toLocaleString()} kg</span></p>
                    <p className="text-xs text-navy-500">Location: <span className="font-semibold text-navy-800">{v.currentCity}</span></p>
                  </div>
                ))}
                {fleet.length === 0 && <p className="col-span-full text-sm text-navy-400">No public vehicles listed.</p>}
              </div>
            </Panel>

            {/* Credentials */}
            <Panel>
              <div className="border-b border-navy-100 px-5 py-4">
                <h2 className="text-base font-semibold text-navy-900">Compliance Documents</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
                {provider.documents.length === 0 && <p className="col-span-full text-sm text-navy-400">No public documents.</p>}
                {provider.documents.map((d) => (
                  <div key={d.id} className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-2 text-xs font-semibold text-navy-900">{d.label}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Lead gen panel */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <Panel className="p-5">
              <h2 className="text-base font-semibold text-navy-900">Request Transport</h2>
              <p className="mt-1 text-sm text-navy-500">Get a logistics quote or start a chat.</p>
              <div className="mt-4 space-y-2.5">
                <a href={whatsappLink(`Hello ${provider.displayName}, I need a freight quote.`)} target="_blank" rel="noopener noreferrer" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-whatsapp-dark">
                  <WhatsAppIcon className="h-5 w-5" />Contact via WhatsApp
                </a>
                <a href={`mailto:${provider.email}`} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors duration-200 hover:bg-navy-50">
                  <Mail className="h-4 w-4" aria-hidden="true" />Email Inquiry
                </a>
                <button type="button" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />Send Message
                </button>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-navy-100 pt-4">
                <Stars rating={provider.rating} size={14} />
                <span className="text-xs text-navy-500">{provider.rating.toFixed(1)} rating</span>
              </div>
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
      {rating !== undefined && <div className="mt-0.5 flex justify-center"><Stars rating={rating} size={12} /></div>}
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy-500">{label}</p>
    </div>
  );
}

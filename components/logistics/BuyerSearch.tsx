"use client";

import { useMemo, useState } from "react";
import { Building2, MapPin, Search, Star, Truck, User } from "lucide-react";
import type {
  Availability,
  LogisticsProvider,
  VehicleClass,
} from "@/lib/logistics/types";
import { VEHICLE_CLASSES } from "@/lib/logistics/types";
import { AvailabilityBadge, Badge, Button, Panel, Stars, VerificationBadge } from "./ui";

type PublicProvider = LogisticsProvider & { topPayloadKg: number; vehicleClasses: string[] };

export function BuyerSearch({ providers }: { providers: PublicProvider[] }) {
  const [city, setCity] = useState("");
  const [vehicle, setVehicle] = useState<VehicleClass | "Any">("Any");
  const [minPayload, setMinPayload] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [availability, setAvailability] = useState<Availability | "Any">("Any");

  const results = useMemo(
    () =>
      providers.filter((p) => {
        const matchesCity = !city || p.city.toLowerCase().includes(city.toLowerCase());
        const matchesVehicle = vehicle === "Any" || p.vehicleClasses.includes(vehicle);
        const matchesPayload = !minPayload || p.topPayloadKg >= Number(minPayload);
        const matchesRating = p.rating >= Number(minRating);
        const matchesAvail = availability === "Any" || p.availability === availability;
        return matchesCity && matchesVehicle && matchesPayload && matchesRating && matchesAvail;
      }),
    [providers, city, vehicle, minPayload, minRating, availability]
  );

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Find Transport & Drivers</h1>
        <p className="mt-1 text-sm text-navy-500">Search verified logistics providers across the network.</p>
      </div>

      {/* Multi-criteria filters */}
      <Panel className="mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="f-city" className="mb-1.5 block text-xs font-medium text-navy-600">City</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <input id="f-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Any city" className="w-full rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm focus:border-accent-400" />
            </div>
          </div>
          <div>
            <label htmlFor="f-vehicle" className="mb-1.5 block text-xs font-medium text-navy-600">Vehicle Type</label>
            <select id="f-vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value as VehicleClass | "Any")} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              <option value="Any">Any</option>
              {VEHICLE_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-payload" className="mb-1.5 block text-xs font-medium text-navy-600">Min Payload (kg)</label>
            <input id="f-payload" type="number" value={minPayload} onChange={(e) => setMinPayload(e.target.value)} placeholder="0" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
          </div>
          <div>
            <label htmlFor="f-rating" className="mb-1.5 block text-xs font-medium text-navy-600">Min Rating</label>
            <select id="f-rating" value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {["0", "3", "4", "4.5"].map((r) => <option key={r} value={r}>{r === "0" ? "Any" : `${r}+ stars`}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-avail" className="mb-1.5 block text-xs font-medium text-navy-600">Availability</label>
            <select id="f-avail" value={availability} onChange={(e) => setAvailability(e.target.value as Availability | "Any")} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              <option value="Any">Any</option>
              <option value="Available Now">Available Now</option>
              <option value="Busy">Busy</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>
        </div>
      </Panel>

      <p className="mb-4 flex items-center gap-1.5 text-sm text-navy-500">
        <Search className="h-4 w-4" aria-hidden="true" />{results.length} providers found
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <Panel key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
                  {p.kind === "Transport Company" ? <Building2 className="h-5 w-5" aria-hidden="true" /> : <User className="h-5 w-5" aria-hidden="true" />}
                </span>
                <div>
                  <p className="font-semibold text-navy-900">{p.displayName}</p>
                  <p className="flex items-center gap-1 text-xs text-navy-500">
                    <MapPin className="h-3 w-3" aria-hidden="true" />{p.city}, {p.country}
                  </p>
                </div>
              </div>
              <AvailabilityBadge status={p.availability} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Stars rating={p.rating} size={14} />
              <span className="text-xs text-navy-500">{p.rating.toFixed(1)} · {p.completedTrips} trips</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.vehicleClasses.map((c) => (
                <Badge key={c} tone="neutral"><Truck className="h-3 w-3" aria-hidden="true" />{c}</Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-navy-500">Max payload: <span className="font-semibold text-navy-800">{p.topPayloadKg.toLocaleString()} kg</span></p>

            <div className="mt-3">{p.verification === "Approved" ? <VerificationBadge state="Approved" kind={p.kind} /> : <Badge tone="warning">Pending verification</Badge>}</div>

            <a href={`/transport/${p.id}`} className="mt-4 block">
              <Button className="w-full">View Profile</Button>
            </a>
          </Panel>
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-12 text-center text-navy-400">No providers match your filters. Try widening your criteria.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ImageIcon, MapPin, Maximize, Search } from "lucide-react";
import {
  WAREHOUSE_CATEGORIES,
  type FacilityAvailability,
  type WarehouseCategory,
  type WarehouseFacility,
} from "@/lib/warehouse/types";
import { AvailabilityBadge, Badge, Button, Panel, Stars, VerificationBadge } from "./ui";

type PublicFacility = WarehouseFacility & { operatorName: string; rating: number };

export function BuyerSearch({ facilities }: { facilities: PublicFacility[] }) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<WarehouseCategory | "Any">("Any");
  const [minSpace, setMinSpace] = useState("");
  const [maxMonthly, setMaxMonthly] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [availability, setAvailability] = useState<FacilityAvailability | "Any">("Any");

  const results = useMemo(
    () =>
      facilities.filter((f) => {
        const mCountry = !country || f.country.toLowerCase().includes(country.toLowerCase());
        const mCity = !city || f.city.toLowerCase().includes(city.toLowerCase());
        const mCat = category === "Any" || f.category === category;
        const mSpace = !minSpace || f.availableSqm >= Number(minSpace);
        const mPrice = !maxMonthly || f.pricing.monthly <= Number(maxMonthly);
        const mRating = f.rating >= Number(minRating);
        const mAvail = availability === "Any" || f.availability === availability;
        return mCountry && mCity && mCat && mSpace && mPrice && mRating && mAvail;
      }),
    [facilities, country, city, category, minSpace, maxMonthly, minRating, availability]
  );

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Find Warehouse Space</h1>
        <p className="mt-1 text-sm text-navy-500">Search verified storage facilities across the network.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Advanced filter sidebar */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <Panel className="p-5">
            <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-navy-900">
              <Search className="h-4 w-4" aria-hidden="true" />Filters
            </h2>
            <div className="space-y-3">
              <Filter label="Country"><input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Any" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" /></Filter>
              <Filter label="City"><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Any" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" /></Filter>
              <Filter label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value as WarehouseCategory | "Any")} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                  <option value="Any">Any</option>
                  {WAREHOUSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Filter>
              <Filter label="Min Space (sqm)"><input type="number" value={minSpace} onChange={(e) => setMinSpace(e.target.value)} placeholder="0" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" /></Filter>
              <Filter label="Max Monthly ($/sqm)"><input type="number" value={maxMonthly} onChange={(e) => setMaxMonthly(e.target.value)} placeholder="Any" className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" /></Filter>
              <Filter label="Min Rating">
                <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                  {["0", "3", "4", "4.5"].map((r) => <option key={r} value={r}>{r === "0" ? "Any" : `${r}+ stars`}</option>)}
                </select>
              </Filter>
              <Filter label="Availability">
                <select value={availability} onChange={(e) => setAvailability(e.target.value as FacilityAvailability | "Any")} className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                  <option value="Any">Any</option>
                  <option value="Available for Booking">Available for Booking</option>
                  <option value="Full/Max Capacity">Full/Max Capacity</option>
                  <option value="Temporarily Closed">Temporarily Closed</option>
                </select>
              </Filter>
            </div>
          </Panel>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-4 text-sm text-navy-500">{results.length} facilities found</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {results.map((f) => (
              <Panel key={f.id} className="overflow-hidden">
                <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                  <ImageIcon className="h-8 w-8 text-white/30" aria-hidden="true" />
                  <span className="absolute right-3 top-3"><AvailabilityBadge status={f.availability} /></span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-1.5 font-semibold text-navy-900">
                      <MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />{f.name}
                    </h3>
                    <Badge tone="neutral">{f.category}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-navy-500">{f.city}, {f.country} · {f.operatorName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars rating={f.rating} size={14} />
                    <span className="text-xs text-navy-500">{f.rating.toFixed(1)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1 text-navy-600"><Maximize className="h-3.5 w-3.5" aria-hidden="true" />{f.availableSqm.toLocaleString()} sqm free</span>
                    <span className="font-bold text-accent-600">${f.pricing.monthly}/sqm/mo</span>
                  </div>
                  <div className="mt-3">{f.verification === "Approved" ? <VerificationBadge state="Approved" /> : <Badge tone="warning">Pending</Badge>}</div>
                  <a href={`/warehouses/${f.id}`} className="mt-4 block"><Button className="w-full">View Facility</Button></a>
                </div>
              </Panel>
            ))}
            {results.length === 0 && <p className="col-span-full py-12 text-center text-navy-400">No facilities match your filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-navy-600">{label}</label>
      {children}
    </div>
  );
}

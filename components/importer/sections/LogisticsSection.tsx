"use client";

import { useMemo, useState } from "react";
import { Bike, Car, MapPin, Maximize, Search, Truck } from "lucide-react";
import type {
  MarketFleet,
  MarketWarehouse,
} from "@/lib/importer/types";
import { Badge, Button, Panel, PanelHeader, Stars } from "../ui";

const vehicleIcon = (type: MarketFleet["vehicleType"]) => {
  if (type === "Motorcycle") return Bike;
  if (type === "Car") return Car;
  return Truck;
};

export function LogisticsSection({
  warehouses,
  fleet,
}: {
  warehouses: MarketWarehouse[];
  fleet: MarketFleet[];
}) {
  // Warehouse filters
  const [wCountry, setWCountry] = useState("");
  const [wCity, setWCity] = useState("");
  const [wMinSpace, setWMinSpace] = useState("");
  const [wMaxDaily, setWMaxDaily] = useState("");

  // Fleet filters
  const [fCity, setFCity] = useState("");
  const [fType, setFType] = useState<MarketFleet["vehicleType"] | "Any">("Any");
  const [fMinRating, setFMinRating] = useState("0");
  const [fAvailable, setFAvailable] = useState(false);

  const filteredWarehouses = useMemo(
    () =>
      warehouses.filter(
        (w) =>
          (!wCountry || w.country.toLowerCase().includes(wCountry.toLowerCase())) &&
          (!wCity || w.city.toLowerCase().includes(wCity.toLowerCase())) &&
          (!wMinSpace || w.availableSqm >= Number(wMinSpace)) &&
          (!wMaxDaily || w.dailyPrice <= Number(wMaxDaily))
      ),
    [warehouses, wCountry, wCity, wMinSpace, wMaxDaily]
  );

  const filteredFleet = useMemo(
    () =>
      fleet.filter(
        (f) =>
          (!fCity || f.city.toLowerCase().includes(fCity.toLowerCase())) &&
          (fType === "Any" || f.vehicleType === fType) &&
          f.rating >= Number(fMinRating) &&
          (!fAvailable || f.available)
      ),
    [fleet, fCity, fType, fMinRating, fAvailable]
  );

  return (
    <div className="space-y-6">
      {/* Warehouses */}
      <Panel>
        <PanelHeader title="Warehouse Allocation" description="Find and book downstream storage" />
        <div className="border-b border-navy-100 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input value={wCountry} onChange={(e) => setWCountry(e.target.value)} placeholder="Country" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Warehouse country" />
            <input value={wCity} onChange={(e) => setWCity(e.target.value)} placeholder="City" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Warehouse city" />
            <input type="number" value={wMinSpace} onChange={(e) => setWMinSpace(e.target.value)} placeholder="Min space (sqm)" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Min space" />
            <input type="number" value={wMaxDaily} onChange={(e) => setWMaxDaily(e.target.value)} placeholder="Max daily ($/sqm)" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Max daily price" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWarehouses.map((w) => (
            <div key={w.id} className="rounded-xl border border-navy-100 p-4">
              <h3 className="flex items-center gap-1.5 font-semibold text-navy-900"><MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />{w.name}</h3>
              <p className="text-xs text-navy-500">{w.city}, {w.country}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1 text-navy-600"><Maximize className="h-3.5 w-3.5" aria-hidden="true" />{w.availableSqm.toLocaleString()} sqm</span>
                <span className="font-bold text-accent-600">${w.dailyPrice}/sqm/day</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1">Book Storage</Button>
                <Button size="sm" variant="secondary">Details</Button>
              </div>
            </div>
          ))}
          {filteredWarehouses.length === 0 && <p className="col-span-full py-8 text-center text-navy-400">No warehouses match your filters.</p>}
        </div>
      </Panel>

      {/* Fleet transport */}
      <Panel>
        <PanelHeader title="Fleet Transport Booking" description="Arrange land transport" />
        <div className="border-b border-navy-100 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input value={fCity} onChange={(e) => setFCity(e.target.value)} placeholder="City" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Fleet city" />
            <select aria-label="Vehicle type" value={fType} onChange={(e) => setFType(e.target.value as MarketFleet["vehicleType"] | "Any")} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              <option value="Any">Any vehicle</option>
              {["Truck", "Van", "Car", "Motorcycle"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select aria-label="Minimum rating" value={fMinRating} onChange={(e) => setFMinRating(e.target.value)} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {["0", "3", "4", "4.5"].map((r) => <option key={r} value={r}>{r === "0" ? "Any rating" : `${r}+ stars`}</option>)}
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700">
              <input type="checkbox" checked={fAvailable} onChange={(e) => setFAvailable(e.target.checked)} className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
              Available now
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFleet.map((f) => {
            const Icon = vehicleIcon(f.vehicleType);
            return (
              <div key={f.id} className="rounded-xl border border-navy-100 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="inline-flex items-center gap-1.5 font-semibold text-navy-900"><Icon className="h-4 w-4 text-accent-500" aria-hidden="true" />{f.name}</h3>
                  <Badge tone={f.available ? "success" : "neutral"}>{f.available ? "Available" : "Busy"}</Badge>
                </div>
                <p className="text-xs text-navy-500">{f.city} · {f.vehicleType}</p>
                <div className="mt-2 flex items-center gap-2"><Stars rating={f.rating} size={14} /><span className="text-xs text-navy-500">{f.rating.toFixed(1)}</span></div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" disabled={!f.available}>Book Transport</Button>
                  <Button size="sm" variant="secondary">Details</Button>
                </div>
              </div>
            );
          })}
          {filteredFleet.length === 0 && <p className="col-span-full py-8 text-center text-navy-400">No fleet matches your filters.</p>}
        </div>
      </Panel>
    </div>
  );
}

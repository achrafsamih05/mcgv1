"use client";

import { useMemo, useState } from "react";
import { Bookmark, FileText, MapPin, MessageSquare, Package, Search, ShieldCheck } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  type MarketProduct,
  type MarketSupplier,
  type ProductCategory,
} from "@/lib/importer/types";
import { Badge, Button, Panel, Stars } from "../ui";

type Tab = "products" | "suppliers";

export function SourcingSection({
  products,
  suppliers,
  onRequestQuote,
}: {
  products: MarketProduct[];
  suppliers: MarketSupplier[];
  onRequestQuote: () => void;
}) {
  const [tab, setTab] = useState<Tab>("products");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Product filters
  const [pQuery, setPQuery] = useState("");
  const [pCategory, setPCategory] = useState<ProductCategory | "Any">("Any");
  const [pMaxPrice, setPMaxPrice] = useState("");
  const [pCountry, setPCountry] = useState("");

  // Supplier filters
  const [sCountry, setSCountry] = useState("");
  const [sVerified, setSVerified] = useState(false);
  const [sMinRating, setSMinRating] = useState("0");
  const [sMinYears, setSMinYears] = useState("");

  const toggleFav = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (p.name.toLowerCase().includes(pQuery.toLowerCase()) || p.supplierName.toLowerCase().includes(pQuery.toLowerCase())) &&
          (pCategory === "Any" || p.category === pCategory) &&
          (!pMaxPrice || p.priceMin <= Number(pMaxPrice)) &&
          (!pCountry || p.originCountry.toLowerCase().includes(pCountry.toLowerCase()))
      ),
    [products, pQuery, pCategory, pMaxPrice, pCountry]
  );

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          (!sCountry || s.country.toLowerCase().includes(sCountry.toLowerCase())) &&
          (!sVerified || s.verified) &&
          s.rating >= Number(sMinRating) &&
          (!sMinYears || s.years >= Number(sMinYears))
      ),
    [suppliers, sCountry, sVerified, sMinRating, sMinYears]
  );

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-navy-200 bg-white p-1">
        {(["products", "suppliers"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              tab === t ? "bg-accent-500 text-white" : "text-navy-600 hover:bg-navy-50"
            }`}
          >
            {t === "products" ? "Product Discovery" : "Supplier Directory"}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <>
          <Panel className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                <label htmlFor="p-search" className="sr-only">Search products</label>
                <input id="p-search" value={pQuery} onChange={(e) => setPQuery(e.target.value)} placeholder="Keywords…" className="w-full rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm focus:border-accent-400" />
              </div>
              <select aria-label="Category" value={pCategory} onChange={(e) => setPCategory(e.target.value as ProductCategory | "Any")} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                <option value="Any">All Categories</option>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" value={pMaxPrice} onChange={(e) => setPMaxPrice(e.target.value)} placeholder="Max unit price ($)" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Max price" />
              <input value={pCountry} onChange={(e) => setPCountry(e.target.value)} placeholder="Country of origin" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Country of origin" />
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <Panel key={p.id} className="p-4">
                <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-navy-100 text-navy-300">
                  <Package className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone="neutral">{p.category}</Badge>
                    <h3 className="mt-1.5 font-semibold text-navy-900">{p.name}</h3>
                  </div>
                  <button type="button" onClick={() => toggleFav(p.id)} aria-label="Toggle favorite" aria-pressed={favorites.has(p.id)} className="cursor-pointer rounded-lg p-1.5 transition-colors duration-200 hover:bg-navy-50">
                    <Bookmark className={`h-5 w-5 ${favorites.has(p.id) ? "fill-accent-500 text-accent-500" : "text-navy-400"}`} aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-navy-500">{p.supplierName} · {p.originCountry}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold text-accent-600">${p.priceMin}–${p.priceMax}</span>
                  <span className="text-xs text-navy-500">MOQ {p.moq.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={onRequestQuote}><FileText className="h-4 w-4" aria-hidden="true" />Quote</Button>
                  <Button size="sm" variant="secondary"><MessageSquare className="h-4 w-4" aria-hidden="true" />Message</Button>
                </div>
              </Panel>
            ))}
            {filteredProducts.length === 0 && <p className="col-span-full py-12 text-center text-navy-400">No products match your filters.</p>}
          </div>
        </>
      ) : (
        <>
          <Panel className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input value={sCountry} onChange={(e) => setSCountry(e.target.value)} placeholder="Country / Region" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Country" />
              <select aria-label="Minimum rating" value={sMinRating} onChange={(e) => setSMinRating(e.target.value)} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
                {["0", "3", "4", "4.5"].map((r) => <option key={r} value={r}>{r === "0" ? "Any rating" : `${r}+ stars`}</option>)}
              </select>
              <input type="number" value={sMinYears} onChange={(e) => setSMinYears(e.target.value)} placeholder="Min years experience" className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" aria-label="Minimum years" />
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700">
                <input type="checkbox" checked={sVerified} onChange={(e) => setSVerified(e.target.checked)} className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
                Verified only
              </label>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((s) => (
              <Panel key={s.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-900">{s.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-navy-500"><MapPin className="h-3 w-3" aria-hidden="true" />{s.country}</p>
                  </div>
                  <button type="button" onClick={() => toggleFav(s.id)} aria-label="Toggle favorite" aria-pressed={favorites.has(s.id)} className="cursor-pointer rounded-lg p-1.5 transition-colors duration-200 hover:bg-navy-50">
                    <Bookmark className={`h-5 w-5 ${favorites.has(s.id) ? "fill-accent-500 text-accent-500" : "text-navy-400"}`} aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Stars rating={s.rating} size={14} />
                  <span className="text-xs text-navy-500">{s.rating.toFixed(1)}</span>
                  {s.verified && <Badge tone="accent"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Verified</Badge>}
                </div>
                <p className="mt-2 text-sm text-navy-600">{s.specialization}</p>
                <p className="text-xs text-navy-500">{s.years} years experience</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={onRequestQuote}><FileText className="h-4 w-4" aria-hidden="true" />Request Quote</Button>
                  <Button size="sm" variant="secondary"><MessageSquare className="h-4 w-4" aria-hidden="true" />Message</Button>
                </div>
              </Panel>
            ))}
            {filteredSuppliers.length === 0 && <p className="col-span-full py-12 text-center text-navy-400">No suppliers match your filters.</p>}
          </div>
        </>
      )}
    </div>
  );
}

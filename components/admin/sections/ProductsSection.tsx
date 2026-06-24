"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Pencil, Search, Trash2 } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/admin/types";
import { products as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const statusTone: Record<ProductStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Live: "success",
  Hidden: "neutral",
  Flagged: "danger",
};

export function ProductsSection() {
  const [list, setList] = useState<Product[]>(seed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProductStatus | "All">("All");

  const filtered = useMemo(
    () =>
      list.filter(
        (p) =>
          (filter === "All" || p.status === filter) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.supplier.toLowerCase().includes(query.toLowerCase()))
      ),
    [list, query, filter]
  );

  const setStatus = (id: string, status: ProductStatus) =>
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  const remove = (id: string) => setList((prev) => prev.filter((p) => p.id !== id));

  return (
    <Panel>
      <PanelHeader
        title="Platform Catalogue"
        description={`${filtered.length} listings`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <input
                id="product-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-52 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as ProductStatus | "All")}
              className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            >
              {["All", "Live", "Hidden", "Flagged"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="font-semibold text-navy-900">{p.name}</div>
                  <div className="text-xs text-navy-500">{p.id} · listed {p.listedAt}</div>
                </td>
                <td className="px-5 py-3 text-navy-700">{p.category}</td>
                <td className="px-5 py-3 text-navy-700">{p.supplier}</td>
                <td className="px-5 py-3 font-medium text-navy-900">${p.price.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge tone={statusTone[p.status]}>{p.status}</Badge></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" aria-hidden="true" />Edit</Button>
                    {p.status === "Hidden" ? (
                      <Button variant="ghost" size="sm" onClick={() => setStatus(p.id, "Live")}>
                        <Eye className="h-4 w-4" aria-hidden="true" />Show
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setStatus(p.id, "Hidden")}>
                        <EyeOff className="h-4 w-4" aria-hidden="true" />Hide
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => remove(p.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

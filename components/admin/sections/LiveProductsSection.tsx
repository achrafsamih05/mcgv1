"use client";

/**
 * Admin — LIVE Product Moderation.
 *
 * Cross-supplier live view of `public.supplier_products` with admin controls
 * to Flag (delete) a listing. Realtime channel keeps the queue current.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, ImageIcon, Loader2, Package } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { deleteSupplierProduct, fetchAllSupplierProducts } from "@/lib/supabase/queries";
import type { SupplierProduct } from "@/lib/supabase/database.types";
import { Button, Panel, PanelHeader } from "../ui/primitives";

export function LiveProductsSection() {
  const [items, setItems] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchAllSupplierProducts(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      setItems(res.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    void load();
    const channel = db
      .channel("admin:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "supplier_products" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const flag = async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    setBusyId(id);
    await deleteSupplierProduct(db, id);
    setBusyId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Product Moderation" description="Live catalog review" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to moderate live product listings.</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader title="Product Moderation" description={`${items.length} live ${items.length === 1 ? "listing" : "listings"} across all suppliers`} />
      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 p-12 text-navy-400"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading listings…</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
          <Package className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-medium">No product listings on the platform yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Price Range</th>
                <th className="px-5 py-3 font-semibold">MOQ</th>
                <th className="px-5 py-3 font-semibold">Listed</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400">
                        <ImageIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="font-semibold text-navy-900">{p.name}</div>
                        {p.description && <div className="max-w-[320px] truncate text-xs text-navy-500">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-accent-600">{p.price_range ?? "—"}</td>
                  <td className="px-5 py-3 text-navy-700">{(p.moq ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-navy-600">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Button variant="danger" size="sm" disabled={busyId === p.id} onClick={() => flag(p.id)}>
                        {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Flag className="h-4 w-4" aria-hidden="true" />}
                        Flag & Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

"use client";

/**
 * Supplier Command Center — LIVE home section.
 *
 * - "Awaiting Admin Verification" banner while the profile status is PENDING.
 * - Live aggregate metrics via head-only exact-count queries: Total Catalog
 *   Products, Active Sent Quotations, and Won Deals — scoped to the supplier.
 *
 * Brand tokens: deep dark cards (#0F172A) with accent orange (#F97316) metrics.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, Clock, Handshake, Loader2, Send, ShieldCheck } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import {
  countSupplierActiveQuotations,
  countSupplierProducts,
  countSupplierWonDeals,
} from "@/lib/supabase/queries";
import type { VerificationStatus } from "@/lib/supabase/database.types";
import { Panel, PanelHeader } from "../ui";

type Metrics = { products: number; quotations: number; wonDeals: number };

export function SupplierHomeSection({ supplierId }: { supplierId: string | null }) {
  const [metrics, setMetrics] = useState<Metrics>({ products: 0, quotations: 0, wonDeals: 0 });
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const refresh = useCallback(async () => {
    const db = dbRef.current;
    if (!db || !supplierId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [products, quotations, won, profile] = await Promise.all([
      countSupplierProducts(db, supplierId),
      countSupplierActiveQuotations(db, supplierId),
      countSupplierWonDeals(db, supplierId),
      db.from("profiles").select("status").eq("id", supplierId).maybeSingle(),
    ]);
    setMetrics({
      products: products.data ?? 0,
      quotations: quotations.data ?? 0,
      wonDeals: won.data ?? 0,
    });
    setStatus((profile.data?.status as VerificationStatus | undefined) ?? null);
    setLoading(false);
  }, [supplierId]);

  useEffect(() => {
    const db = dbRef.current;
    if (!db || !supplierId) {
      setLoading(false);
      return;
    }
    void refresh();

    const channel = db
      .channel(`supplier:home:${supplierId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "supplier_products", filter: `supplier_id=eq.${supplierId}` }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "quotations", filter: `supplier_id=eq.${supplierId}` }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "deals", filter: `supplier_id=eq.${supplierId}` }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${supplierId}` }, () => void refresh())
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [supplierId, refresh]);

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Supplier Command Center" description="Live metrics" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase to load your live catalog and bidding metrics.
        </div>
      </Panel>
    );
  }

  if (!supplierId) {
    return (
      <Panel>
        <PanelHeader title="Supplier Command Center" description="Live metrics" />
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-navy-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Resolving your session…
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification banner */}
      {status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-xl border border-accent-500/40 bg-navy-950 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-accent-500">Awaiting Admin Verification</p>
            <p className="mt-0.5 text-sm text-navy-200">
              Your manufacturer account is under review. Your storefront and catalog
              stay private until a Super Admin approves you. You can still prepare
              your catalog and submit quotations in the meantime.
            </p>
          </div>
        </div>
      )}
      {status === "APPROVED" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-navy-950 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-navy-100">
            Your account is <span className="font-bold text-emerald-400">verified</span>. Your storefront is live across the marketplace.
          </p>
        </div>
      )}
      {status === "REJECTED" && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-navy-950 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-navy-100">
            Your verification was <span className="font-bold text-red-400">rejected</span>. Please contact support to re-submit your documents.
          </p>
        </div>
      )}

      {/* Live metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total Catalog Products" value={metrics.products} icon={<Boxes className="h-5 w-5" />} accent loading={loading} />
        <MetricCard label="Active Sent Quotations" value={metrics.quotations} icon={<Send className="h-5 w-5" />} loading={loading} />
        <MetricCard label="Won Deals" value={metrics.wonDeals} icon={<Handshake className="h-5 w-5" />} loading={loading} />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-800 bg-navy-950 p-5 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-accent-500 text-white" : "bg-navy-800 text-accent-400"}`}>
        {icon}
      </span>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${accent ? "text-accent-500" : "text-white"}`}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy-500" aria-hidden="true" /> : value.toLocaleString()}
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</p>
    </div>
  );
}

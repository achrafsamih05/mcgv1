"use client";

/**
 * Admin — LIVE Financial Management.
 *
 * Aggregates the `wallets` ledger for total escrow locked and total available
 * balance, derives platform net revenue from the live commission rate applied
 * to completed deals, and visualizes the split with the project's dependency-
 * free SVG charts (design-token colored). Realtime-subscribed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, TrendingUp, Wallet as WalletIcon } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import {
  fetchDeals,
  fetchFinancialSummary,
  fetchPlatformSettings,
} from "@/lib/supabase/queries";
import type { Deal } from "@/lib/supabase/database.types";
import { Panel, PanelHeader } from "../ui/primitives";
import { BarChart, ChartLegend, DonutChart } from "../ui/charts";

interface FinState {
  totalEscrow: number;
  totalBalance: number;
  grossCompleted: number;
  netRevenue: number;
  commissionRate: number;
}

const zero: FinState = {
  totalEscrow: 0,
  totalBalance: 0,
  grossCompleted: 0,
  netRevenue: 0,
  commissionRate: 5,
};

export function LiveFinancialSection() {
  const [fin, setFin] = useState<FinState>(zero);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [summary, dealRes, settings] = await Promise.all([
      fetchFinancialSummary(db),
      fetchDeals(db),
      fetchPlatformSettings(db),
    ]);
    if (summary.error) setError(summary.error);
    else setError(null);

    const rate =
      settings.data?.find((s) => s.key === "supplier_commission")?.value ?? 5;
    const dealsData = dealRes.data ?? [];
    const grossCompleted = dealsData
      .filter((d) => d.status === "COMPLETED")
      .reduce((s, d) => s + Number(d.gross_valuation ?? 0), 0);

    setDeals(dealsData);
    setFin({
      totalEscrow: summary.data?.totalEscrow ?? 0,
      totalBalance: summary.data?.totalBalance ?? 0,
      grossCompleted,
      netRevenue: grossCompleted * (rate / 100),
      commissionRate: rate,
    });
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
      .channel("admin:financial")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const money = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toFixed(2)}`;

  // Group completed-deal value into monthly buckets for the bar chart.
  const monthly = (() => {
    const buckets = new Map<string, number>();
    for (const d of deals) {
      if (d.status !== "COMPLETED") continue;
      const label = new Date(d.created_at).toLocaleDateString(undefined, { month: "short" });
      buckets.set(label, (buckets.get(label) ?? 0) + Number(d.gross_valuation ?? 0));
    }
    return Array.from(buckets.entries()).slice(-6).map(([label, value]) => ({
      label,
      value,
      secondary: value * (fin.commissionRate / 100),
    }));
  })();

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Financial Management" description="Live ledger" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to load live financials.</div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinCard label="Locked in Escrow" value={loading ? "…" : money(fin.totalEscrow)} icon={<WalletIcon className="h-5 w-5" />} accent />
        <FinCard label="Available Balances" value={loading ? "…" : money(fin.totalBalance)} icon={<WalletIcon className="h-5 w-5" />} />
        <FinCard label="Completed Deal Volume" value={loading ? "…" : money(fin.grossCompleted)} icon={<TrendingUp className="h-5 w-5" />} />
        <FinCard label={`Net Revenue (${fin.commissionRate}%)`} value={loading ? "…" : money(fin.netRevenue)} icon={<TrendingUp className="h-5 w-5" />} accent />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Revenue vs Commission" description="Completed-deal volume, monthly" />
          <div className="p-5">
            <ChartLegend items={[{ label: "Deal Volume", color: "#0F172A" }, { label: "Commission", color: "#F97316" }]} />
            <div className="mt-3 h-56">
              {loading ? (
                <div className="flex h-full items-center justify-center text-navy-400"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /></div>
              ) : monthly.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-navy-400">No completed deals yet.</p>
              ) : (
                <BarChart data={monthly} />
              )}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Escrow vs Available" description="Platform-wide fund distribution" />
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-navy-400"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading…</div>
            ) : fin.totalEscrow + fin.totalBalance === 0 ? (
              <p className="py-8 text-center text-sm text-navy-400">No wallet funds recorded yet.</p>
            ) : (
              <DonutChart
                data={[
                  { label: "Escrow (locked)", value: Math.max(fin.totalEscrow, 0.01), color: "#F97316" },
                  { label: "Available", value: Math.max(fin.totalBalance, 0.01), color: "#0F172A" },
                ]}
              />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function FinCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-800 bg-navy-950 p-5 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-accent-500 text-white" : "bg-navy-800 text-accent-400"}`}>
        {icon}
      </span>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${accent ? "text-accent-500" : "text-white"}`}>{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</p>
    </div>
  );
}

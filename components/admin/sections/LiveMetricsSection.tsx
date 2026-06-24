"use client";

/**
 * Super Admin — Global Live Metrics.
 *
 * Live aggregate counters (head-only exact counts + a deals sum) for platform
 * users by role, active RFQs, completed shipments and the financial run-rate.
 * Pure-SVG donut visualizes the user mix. A realtime channel on `profiles`,
 * `rfqs` and `deals` keeps every number live without a refresh.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import {
  countCompletedShipmentsGlobal,
  countProfilesByRole,
  countRfqsByStatus,
  fetchPlatformRunRate,
} from "@/lib/supabase/queries";
import { StatCard } from "../ui/StatCard";
import { Panel, PanelHeader } from "../ui/primitives";
import { DonutChart } from "../ui/charts";

type Metrics = {
  buyers: number;
  suppliers: number;
  warehouses: number;
  drivers: number;
  totalUsers: number;
  activeRfqs: number;
  completedShipments: number;
  runRate: number;
};

const zero: Metrics = {
  buyers: 0,
  suppliers: 0,
  warehouses: 0,
  drivers: 0,
  totalUsers: 0,
  activeRfqs: 0,
  completedShipments: 0,
  runRate: 0,
};

export function LiveMetricsSection() {
  const [m, setM] = useState<Metrics>(zero);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const refresh = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [buyers, suppliers, warehouses, drivers, activeRfqs, completed, runRate] =
      await Promise.all([
        countProfilesByRole(db, "BUYER"),
        countProfilesByRole(db, "SUPPLIER"),
        countProfilesByRole(db, "WAREHOUSE_HOST"),
        countProfilesByRole(db, "DRIVER"),
        countRfqsByStatus(db, "OPEN"),
        countCompletedShipmentsGlobal(db),
        fetchPlatformRunRate(db),
      ]);

    const firstError =
      buyers.error || suppliers.error || warehouses.error || drivers.error ||
      activeRfqs.error || completed.error || runRate.error;
    if (firstError) setError(firstError);
    else setError(null);

    const b = buyers.data ?? 0;
    const s = suppliers.data ?? 0;
    const w = warehouses.data ?? 0;
    const d = drivers.data ?? 0;
    setM({
      buyers: b,
      suppliers: s,
      warehouses: w,
      drivers: d,
      totalUsers: b + s + w + d,
      activeRfqs: activeRfqs.data ?? 0,
      completedShipments: completed.data ?? 0,
      runRate: runRate.data ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    void refresh();

    const channel = db
      .channel("admin:metrics")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "rfqs" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, () => void refresh())
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [refresh]);

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Global Live Metrics" description="Platform-wide counters" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase to load live platform metrics.
        </div>
      </Panel>
    );
  }

  const fmtMoney = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n.toLocaleString()}`;

  const v = (n: number) => (loading ? "…" : n.toLocaleString());

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy-700">Platform Users</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard data={{ id: "u-total", label: "Total Users", value: v(m.totalUsers), intent: "accent" }} />
          <StatCard data={{ id: "u-buyers", label: "Buyers", value: v(m.buyers) }} />
          <StatCard data={{ id: "u-suppliers", label: "Suppliers", value: v(m.suppliers) }} />
          <StatCard data={{ id: "u-warehouses", label: "Warehouses", value: v(m.warehouses) }} />
          <StatCard data={{ id: "u-drivers", label: "Logistics", value: v(m.drivers) }} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy-700">Operations & Finance</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard data={{ id: "o-rfqs", label: "Active RFQs", value: v(m.activeRfqs), intent: "accent" }} />
          <StatCard data={{ id: "o-shipments", label: "Completed Shipments", value: v(m.completedShipments) }} />
          <StatCard data={{ id: "o-runrate", label: "Financial Run-rate", value: loading ? "…" : fmtMoney(m.runRate), intent: "success" }} />
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      <Panel>
        <PanelHeader title="User Mix by Role" description="Live distribution across personas" />
        <div className="p-5">
          {loading && m.totalUsers === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-navy-400">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading distribution…
            </div>
          ) : m.totalUsers === 0 ? (
            <p className="py-8 text-center text-sm text-navy-400">No users registered yet.</p>
          ) : (
            <DonutChart
              data={[
                { label: "Buyers", value: m.buyers, color: "#F97316" },
                { label: "Suppliers", value: m.suppliers, color: "#0F172A" },
                { label: "Warehouses", value: m.warehouses, color: "#3b82f6" },
                { label: "Logistics", value: m.drivers, color: "#10b981" },
              ]}
            />
          )}
        </div>
      </Panel>
    </div>
  );
}

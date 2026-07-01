"use client";

/**
 * Admin — LIVE User Directory.
 *
 * Live-paginated, searchable (name/company), role-filtered view of
 * `public.profiles`. Realtime channel refreshes the current page when users
 * sign up or change. Graceful loading + error states, no mock fallback.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { fetchProfilesPage } from "@/lib/supabase/queries";
import type { PlatformRole, Profile, VerificationStatus } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

const PAGE_SIZE = 10;

const ROLE_FILTERS: (PlatformRole | "ALL")[] = [
  "ALL",
  "BUYER",
  "SUPPLIER",
  "WAREHOUSE_HOST",
  "DRIVER",
  "SUPER_ADMIN",
];

const statusTone: Record<VerificationStatus, Parameters<typeof Badge>[0]["tone"]> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const roleLabel: Record<PlatformRole, string> = {
  BUYER: "Buyer",
  SUPPLIER: "Supplier",
  WAREHOUSE_HOST: "Warehouse",
  DRIVER: "Driver",
  SUPER_ADMIN: "Admin",
  ADMIN: "Admin",
};

export function LiveUsersSection() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState<PlatformRole | "ALL">("ALL");
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when filters change.
  useEffect(() => {
    setPage(0);
  }, [debounced, role]);

  const load = useCallback(async () => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchProfilesPage(db, { page, pageSize: PAGE_SIZE, search: debounced, role });
    if (res.error) setError(res.error);
    else {
      setError(null);
      setRows(res.data?.rows ?? []);
      setTotal(res.data?.total ?? 0);
    }
    setLoading(false);
  }, [page, debounced, role]);

  useEffect(() => {
    const db = dbRef.current;
    if (!db) {
      setLoading(false);
      return;
    }
    void load();
    const channel = db
      .channel("admin:users")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="User Directory" description="Live accounts" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to load the live user directory.</div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title="User Directory"
        description={`${total} total ${total === 1 ? "account" : "accounts"}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="user-dir-search" className="sr-only">Search users</label>
              <input
                id="user-dir-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or company…"
                className="w-56 rounded-lg border border-navy-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <select
              aria-label="Filter by role"
              value={role}
              onChange={(e) => setRole(e.target.value as PlatformRole | "ALL")}
              className="cursor-pointer rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:border-accent-400"
            >
              {ROLE_FILTERS.map((r) => (
                <option key={r} value={r}>{r === "ALL" ? "All Roles" : roleLabel[r]}</option>
              ))}
            </select>
          </div>
        }
      />

      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Registered</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {loading && rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-navy-400"><Loader2 className="mx-auto h-5 w-5 animate-spin" aria-hidden="true" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-navy-400">No accounts match the current filters.</td></tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-navy-900">{u.company_name || u.full_name || "Unnamed"}</div>
                    <div className="text-xs text-navy-500">{u.full_name ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3"><Badge tone="neutral">{roleLabel[u.role]}</Badge></td>
                  <td className="px-5 py-3 text-navy-700">{u.phone_number ?? "—"}</td>
                  <td className="px-5 py-3 text-navy-600">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone[u.status]}>{u.status}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-navy-100 px-5 py-3">
        <p className="text-xs text-navy-500">Page {page + 1} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />Prev
          </Button>
          <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
            Next<ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Panel>
  );
}

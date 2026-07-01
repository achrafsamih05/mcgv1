"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type { AccountStatus, AccountType, User } from "@/lib/admin/types";
import { users as seedUsers } from "@/lib/admin/data";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";
import { Modal } from "../ui/Modal";
import { LiveUsersSection } from "./LiveUsersSection";

const statusTone: Record<AccountStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Active: "success",
  Pending: "warning",
  Suspended: "info",
  Banned: "danger",
  Deactivated: "neutral",
};

const accountTypes: (AccountType | "All")[] = [
  "All",
  "Buyer",
  "Supplier",
  "Driver",
  "Transport Company",
  "Warehouse",
];

const statuses: (AccountStatus | "All")[] = [
  "All",
  "Active",
  "Pending",
  "Suspended",
  "Banned",
  "Deactivated",
];

export function UsersSection() {
  const [data, setData] = useState<User[]>(seedUsers);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof accountTypes)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("All");

  // Action modal state
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.id.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "All" || u.accountType === typeFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [data, query, typeFilter, statusFilter]);

  const setStatus = (id: string, status: AccountStatus) =>
    setData((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

  const confirmBan = () => {
    if (!banTarget || !banReason.trim()) return;
    setStatus(banTarget.id, "Banned");
    setBanTarget(null);
    setBanReason("");
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleteConfirm !== "DELETE") return;
    setData((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteConfirm("");
  };

  return (
    <div className="space-y-6">
      <LiveUsersSection />
      <Panel>
      <PanelHeader
        title="All Accounts"
        description={`${filtered.length} of ${data.length} users`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="user-search" className="sr-only">Search users</label>
              <input
                id="user-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, ID…"
                className="w-56 rounded-lg border border-navy-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <select
              aria-label="Filter by account type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="cursor-pointer rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:border-accent-400"
            >
              {accountTypes.map((t) => (
                <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="cursor-pointer rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:border-accent-400"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Country</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Registered</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((u) => (
              <tr key={u.id} className="transition-colors duration-150 hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="font-semibold text-navy-900">{u.name}</div>
                  <div className="text-xs text-navy-500">{u.email} · {u.id}</div>
                </td>
                <td className="px-5 py-3 text-navy-700">{u.country}</td>
                <td className="px-5 py-3">
                  <Badge tone="neutral">{u.accountType}</Badge>
                </td>
                <td className="px-5 py-3 text-navy-600">{u.registeredAt}</td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone[u.status]}>{u.status}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="relative flex justify-end">
                    <button
                      type="button"
                      aria-label={`Actions for ${u.name}`}
                      onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-navy-500 hover:bg-navy-100 hover:text-navy-900"
                    >
                      <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {openMenu === u.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} aria-hidden="true" />
                        <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-xl">
                          <MenuItem icon={Pencil} label="Edit Profile" onClick={() => setOpenMenu(null)} />
                          {u.status === "Active" ? (
                            <MenuItem
                              icon={Power}
                              label="Deactivate"
                              onClick={() => { setStatus(u.id, "Deactivated"); setOpenMenu(null); }}
                            />
                          ) : (
                            <MenuItem
                              icon={RotateCcw}
                              label="Re-activate"
                              tone="success"
                              onClick={() => { setStatus(u.id, "Active"); setOpenMenu(null); }}
                            />
                          )}
                          <MenuItem
                            icon={Ban}
                            label="Ban User"
                            tone="warning"
                            onClick={() => { setBanTarget(u); setOpenMenu(null); }}
                          />
                          <MenuItem
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onClick={() => { setDeleteTarget(u); setOpenMenu(null); }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-navy-400">
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ban modal — reason required */}
      <Modal
        open={!!banTarget}
        onClose={() => { setBanTarget(null); setBanReason(""); }}
        title={`Ban ${banTarget?.name ?? ""}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>Banning revokes platform access immediately. A reason is required and logged to the audit trail.</p>
          </div>
          <div>
            <label htmlFor="ban-reason" className="mb-1.5 block text-sm font-medium text-navy-800">
              Reason for ban
            </label>
            <textarea
              id="ban-reason"
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Describe the policy violation…"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setBanTarget(null); setBanReason(""); }}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!banReason.trim()} onClick={confirmBan}>
              <Ban className="h-4 w-4" aria-hidden="true" />
              Confirm Ban
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal — double confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteConfirm(""); }}
        title={`Delete ${deleteTarget?.name ?? ""}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              This permanently deletes the account and is <strong>irreversible</strong>.
              Type <code className="rounded bg-red-100 px-1 font-mono">DELETE</code> to confirm.
            </p>
          </div>
          <input
            aria-label="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-red-400"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setDeleteTarget(null); setDeleteConfirm(""); }}>
              Cancel
            </Button>
            <Button variant="danger" disabled={deleteConfirm !== "DELETE"} onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Panel>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600 hover:bg-red-50"
      : tone === "warning"
      ? "text-amber-600 hover:bg-amber-50"
      : tone === "success"
      ? "text-emerald-600 hover:bg-emerald-50"
      : "text-navy-700 hover:bg-navy-50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${toneClass}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

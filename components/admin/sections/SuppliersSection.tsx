"use client";

import { useState } from "react";
import { Check, Clock, FileText, X } from "lucide-react";
import type { Supplier, VerificationStatus } from "@/lib/admin/types";
import { pendingSuppliers } from "@/lib/admin/data";
import { Badge, Button, Panel, Toggle, VerifiedPill } from "../ui/primitives";
import { VerificationSection } from "./VerificationSection";

const statusTone: Record<VerificationStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
};

export function SuppliersSection() {
  const [list, setList] = useState<Supplier[]>(pendingSuppliers);
  const [selectedId, setSelectedId] = useState<string>(pendingSuppliers[0]?.id ?? "");
  const [comment, setComment] = useState("");

  const selected = list.find((s) => s.id === selectedId);

  const setVerdict = (status: VerificationStatus) => {
    if (!selected) return;
    setList((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? { ...s, status, verified: status === "Approved" ? s.verified : false }
          : s
      )
    );
    setComment("");
  };

  const toggleBadge = (next: boolean) =>
    setList((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, verified: next } : s))
    );

  return (
    <div className="space-y-6">
      {/* Loop A — live, backend-driven pending-account queue. */}
      <VerificationSection />

      {/* Detailed KYC document review workspace. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      {/* Pending list */}
      <Panel className="overflow-hidden">
        <div className="border-b border-navy-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-navy-900">Pending Approval</h2>
          <p className="text-xs text-navy-500">{list.filter((s) => s.status === "Pending").length} awaiting review</p>
        </div>
        <ul className="max-h-[640px] divide-y divide-navy-100 overflow-y-auto">
          {list.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-colors duration-150 ${
                  selectedId === s.id ? "bg-accent-50" : "hover:bg-navy-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-navy-900">{s.company}</span>
                  <Badge tone={statusTone[s.status]}>{s.status}</Badge>
                </span>
                <span className="text-xs text-navy-500">{s.specialization} · {s.country}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {/* KYC detail view */}
      <Panel>
        {selected ? (
          <div>
            <div className="flex flex-col gap-3 border-b border-navy-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy-900">{selected.company}</h2>
                <p className="text-sm text-navy-500">
                  {selected.specialization} · {selected.country} · Submitted {selected.submittedAt}
                </p>
              </div>
              <VerifiedPill label="Verified Supplier" verified={selected.verified} />
            </div>

            <div className="space-y-6 p-5">
              {/* Documents */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-navy-700">KYC Documents</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selected.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-navy-100 bg-navy-50/50 p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-900">{doc.label}</p>
                        <p className="truncate text-xs text-navy-500">{doc.type} · {doc.fileName}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">View</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge toggle */}
              <div className="flex items-center justify-between rounded-lg border border-navy-100 bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-navy-900">Grant Verified Supplier Badge</p>
                  <p className="text-xs text-navy-500">The absolute digital trust badge shown across the platform.</p>
                </div>
                <Toggle
                  checked={selected.verified}
                  onChange={toggleBadge}
                  label="Toggle verified supplier badge"
                />
              </div>

              {/* Verdict */}
              <div>
                <label htmlFor="verdict-comment" className="mb-1.5 block text-sm font-semibold text-navy-700">
                  CEO Verdict Comments
                </label>
                <textarea
                  id="verdict-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Required when rejecting…"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="success" onClick={() => setVerdict("Approved")}>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    disabled={!comment.trim()}
                    onClick={() => setVerdict("Rejected")}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Reject with Comments
                  </Button>
                  <Button variant="secondary" onClick={() => setVerdict("Pending")}>
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    Keep Pending
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-navy-400">Select a supplier to review.</div>
        )}
      </Panel>
      </div>
    </div>
  );
}

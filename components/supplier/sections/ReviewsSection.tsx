"use client";

import type { Review, SupplierProfile } from "@/lib/supplier/types";
import { scopeToTenant, type SupplierSession } from "@/lib/supplier/rbac";
import { Badge, Panel, PanelHeader, Stars, VerificationBadge } from "../ui";

export function ReviewsSection({
  session,
  profile,
  seedReviews,
}: {
  session: SupplierSession;
  profile: SupplierProfile;
  seedReviews: Review[];
}) {
  const reviews = scopeToTenant(session, seedReviews);

  // Rating distribution 5..1
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const total = reviews.length || 1;

  return (
    <div className="space-y-5">
      {/* Verification status flag */}
      <Panel>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-navy-900">Verification Status</h2>
            <p className="mt-0.5 text-sm text-navy-500">
              Set by the Super Admin. When Approved, the Verified Supplier badge mounts across the platform.
            </p>
          </div>
          <VerificationBadge state={profile.verification} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Summary */}
        <Panel className="h-fit p-5">
          <p className="text-sm font-medium text-navy-500">Aggregate Rating</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-bold text-navy-900">{profile.rating.toFixed(1)}</span>
            <span className="mb-1 text-sm text-navy-500">/ 5</span>
          </div>
          <div className="mt-1"><Stars rating={profile.rating} /></div>
          <p className="mt-1 text-xs text-navy-500">{profile.reviewCount} verified reviews</p>

          <div className="mt-4 space-y-1.5">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-navy-600">{d.star}</span>
                <Stars rating={d.star} size={12} />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
                  <div className="h-full rounded-full bg-accent-500" style={{ width: `${(d.count / total) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-navy-500">{d.count}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Feedback log */}
        <Panel>
          <PanelHeader title="Buyer Testimonials" description="Reviews from completed transactions" />
          <ul className="divide-y divide-navy-100">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                      {r.buyerName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{r.buyerName}</p>
                      <p className="text-xs text-navy-500">{r.createdAt} · {r.orderRef}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-2 text-sm text-navy-600">“{r.comment}”</p>
                <Badge tone="success">Verified Purchase</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

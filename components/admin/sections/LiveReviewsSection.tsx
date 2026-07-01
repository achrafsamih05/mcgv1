"use client";

/**
 * Admin — LIVE Reviews & Ratings.
 *
 * Reads `public.reviews` joined to author + target profiles, shows the global
 * average rating, a live feedback feed with stars/comments, and admin overrides
 * to Flag or Delete a review. Realtime-subscribed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Loader2, Star, Trash2 } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import { deleteReview, fetchReviews, setReviewFlag } from "@/lib/supabase/queries";
import type { ReviewWithParties } from "@/lib/supabase/database.types";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";

function partyName(p: { full_name: string | null; company_name: string | null } | null): string {
  return p?.company_name || p?.full_name || "Anonymous";
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-accent-500 text-accent-500" : "fill-navy-100 text-navy-200"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function LiveReviewsSection() {
  const [reviews, setReviews] = useState<ReviewWithParties[]>([]);
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
    const res = await fetchReviews(db);
    if (res.error) setError(res.error);
    else {
      setError(null);
      setReviews(res.data ?? []);
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
      .channel("admin:reviews")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => void load())
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [load]);

  const flag = async (id: string, flagged: boolean) => {
    const db = dbRef.current;
    if (!db) return;
    setBusyId(id);
    await setReviewFlag(db, id, flagged);
    setBusyId(null);
  };

  const remove = async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    setBusyId(id);
    await deleteReview(db, id);
    setBusyId(null);
  };

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Reviews & Ratings" description="Live feedback" />
        <div className="p-10 text-center text-sm text-navy-500">Connect Supabase to load live reviews.</div>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      {/* Global average */}
      <div className="rounded-xl border border-navy-800 bg-navy-950 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Global Rating Average</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-4xl font-bold tracking-tight text-accent-500">
            {loading ? "…" : average.toFixed(2)}
          </span>
          <div className="mb-1">
            <Stars rating={Math.round(average)} />
            <p className="mt-0.5 text-xs text-navy-400">{reviews.length} total reviews</p>
          </div>
        </div>
      </div>

      <Panel>
        <PanelHeader title="Feedback Feed" description="Live buyer & partner ratings" />
        {error && (
          <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        )}
        {loading && reviews.length === 0 ? (
          <SkeletonRows />
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-400">No reviews submitted yet.</div>
        ) : (
          <ul className="divide-y divide-navy-100">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      {r.is_flagged && <Badge tone="danger">Flagged</Badge>}
                    </div>
                    <p className="mt-1.5 text-sm text-navy-700">{r.comment || <span className="italic text-navy-400">No comment</span>}</p>
                    <p className="mt-1 text-xs text-navy-500">
                      {partyName(r.author)} → {partyName(r.target)} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button variant="secondary" size="sm" disabled={busyId === r.id} onClick={() => flag(r.id, !r.is_flagged)}>
                      <Flag className="h-4 w-4" aria-hidden="true" />
                      {r.is_flagged ? "Unflag" : "Flag"}
                    </Button>
                    <Button variant="danger" size="sm" disabled={busyId === r.id} onClick={() => remove(r.id)}>
                      {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-navy-100" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="px-5 py-4">
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-navy-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-navy-50" />
        </li>
      ))}
    </ul>
  );
}

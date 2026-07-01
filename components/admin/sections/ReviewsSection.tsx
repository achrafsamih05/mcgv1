"use client";

import { useState } from "react";
import { Flag, Star, Trash2 } from "lucide-react";
import type { Review } from "@/lib/admin/types";
import { reviews as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";
import { LiveReviewsSection } from "./LiveReviewsSection";

const statusTone: Record<Review["status"], Parameters<typeof Badge>[0]["tone"]> = {
  Published: "success",
  Flagged: "warning",
  Removed: "neutral",
};

function MiniStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={i < rating ? "h-3.5 w-3.5 fill-accent-500 text-accent-500" : "h-3.5 w-3.5 fill-navy-100 text-navy-200"}
        />
      ))}
    </span>
  );
}

export function ReviewsSection() {
  const [list, setList] = useState<Review[]>(seed);

  const flag = (id: string) =>
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Flagged" } : r)));
  const remove = (id: string) =>
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Removed" } : r)));

  return (
    <div className="space-y-6">
      <LiveReviewsSection />
      <Panel>
      <PanelHeader title="Reviews Audit Trail" description="Flag and erase fraudulent or defamatory feedback" />
      <ul className="divide-y divide-navy-100">
        {list.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MiniStars rating={r.rating} />
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                <span className="text-xs text-navy-500">{r.createdAt}</span>
              </div>
              <p className="mt-1.5 text-sm text-navy-800">
                <span className="font-semibold">{r.author}</span> on{" "}
                <span className="font-semibold">{r.target}</span>
              </p>
              <p className={`mt-0.5 text-sm ${r.status === "Removed" ? "italic text-navy-400 line-through" : "text-navy-600"}`}>
                “{r.comment}”
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" size="sm" onClick={() => flag(r.id)} disabled={r.status === "Removed"}>
                <Flag className="h-4 w-4" aria-hidden="true" />Flag
              </Button>
              <Button variant="danger" size="sm" onClick={() => remove(r.id)} disabled={r.status === "Removed"}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />Erase
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
    </div>
  );
}

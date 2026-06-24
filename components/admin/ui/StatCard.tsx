"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { StatCardData } from "@/lib/admin/types";

const intentRing: Record<NonNullable<StatCardData["intent"]>, string> = {
  default: "border-navy-100",
  accent: "border-accent-200 ring-1 ring-accent-100",
  danger: "border-red-200 ring-1 ring-red-100",
  success: "border-emerald-200 ring-1 ring-emerald-100",
};

const intentValue: Record<NonNullable<StatCardData["intent"]>, string> = {
  default: "text-navy-900",
  accent: "text-accent-600",
  danger: "text-red-600",
  success: "text-emerald-600",
};

export function StatCard({ data }: { data: StatCardData }) {
  const intent = data.intent ?? "default";
  const up = (data.delta ?? 0) >= 0;
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${intentRing[intent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
        {data.label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className={`text-2xl font-bold tracking-tight ${intentValue[intent]}`}>
          {data.value}
        </span>
        {data.delta !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              up ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {up ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {Math.abs(data.delta)}%
          </span>
        )}
      </div>
      {data.hint ? (
        <p className="mt-1 text-xs text-navy-400">{data.hint}</p>
      ) : null}
    </div>
  );
}

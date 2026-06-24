"use client";

import { ReactNode } from "react";
import { BadgeCheck, Star } from "lucide-react";
import type { FacilityAvailability, VerificationState } from "@/lib/warehouse/types";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-navy-100 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-navy-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-navy-900">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-navy-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost";
const variants: Record<Variant, string> = {
  primary: "bg-accent-500 text-white hover:bg-accent-600",
  secondary: "border border-navy-200 bg-white text-navy-800 hover:bg-navy-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  ghost: "text-navy-600 hover:bg-navy-100",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizing = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizing} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";
const tones: Record<Tone, string> = {
  neutral: "bg-navy-100 text-navy-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  accent: "bg-accent-100 text-accent-700",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function VerificationBadge({ state }: { state: VerificationState }) {
  if (state === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
        Verified Warehouse
      </span>
    );
  }
  if (state === "Pending") return <Badge tone="warning">Verification Pending</Badge>;
  return <Badge tone="danger">Verification Rejected</Badge>;
}

export function AvailabilityBadge({ status }: { status: FacilityAvailability }) {
  const map: Record<FacilityAvailability, { tone: Tone; dot: string }> = {
    "Available for Booking": { tone: "success", dot: "bg-emerald-500" },
    "Full/Max Capacity": { tone: "danger", dot: "bg-red-500" },
    "Temporarily Closed": { tone: "accent", dot: "bg-accent-500" },
  };
  const { tone, dot } = map[status];
  return (
    <Badge tone={tone}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {status}
    </Badge>
  );
}

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          style={{ width: size, height: size }}
          className={i < rounded ? "fill-accent-500 text-accent-500" : "fill-navy-100 text-navy-200"}
        />
      ))}
    </span>
  );
}

export function StatBlock({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-accent-500 text-white" : "bg-navy-50 text-navy-700"}`}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold tracking-tight text-navy-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
    </div>
  );
}

/** Inline availability toggle for facility status control. */
export function StatusToggle({
  status,
  onChange,
}: {
  status: FacilityAvailability;
  onChange: (next: FacilityAvailability) => void;
}) {
  const options: FacilityAvailability[] = [
    "Available for Booking",
    "Full/Max Capacity",
    "Temporarily Closed",
  ];
  return (
    <select
      aria-label="Facility availability status"
      value={status}
      onChange={(e) => onChange(e.target.value as FacilityAvailability)}
      className="cursor-pointer rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs font-medium focus:border-accent-400"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

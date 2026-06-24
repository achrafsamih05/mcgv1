"use client";

import { ReactNode } from "react";

/* ----------------------------- Badge ----------------------------- */

type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-navy-100 text-navy-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  accent: "bg-accent-100 text-accent-700",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

/* --------------------------- Verified pill --------------------------- */

export function VerifiedPill({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return verified ? (
    <Badge tone="success">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      {label}
    </Badge>
  ) : (
    <Badge tone="neutral">Unverified</Badge>
  );
}

/* ----------------------------- Card shell ----------------------------- */

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-navy-100 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
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
        {description ? (
          <p className="mt-0.5 text-sm text-navy-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ----------------------------- Buttons ----------------------------- */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";

const buttonVariants: Record<ButtonVariant, string> = {
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
  variant?: ButtonVariant;
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizing = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${sizing} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ----------------------------- Toggle ----------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-emerald-500" : "bg-navy-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

"use client";

import { useState } from "react";
import { Bell, Globe, Menu } from "lucide-react";
import type { CoreSectionId } from "@/lib/core/types";
import type { CurrencyCode, LocaleCode } from "@/lib/core/types";
import { CURRENCIES, LOCALES } from "@/lib/core/i18n";
import { coreSectionMeta } from "./nav";
import { NotificationBell } from "./sections/NotificationBell";

export function CoreTopbar({
  section,
  locale,
  currency,
  onLocale,
  onCurrency,
  onOpenMobile,
}: {
  section: CoreSectionId;
  locale: LocaleCode;
  currency: CurrencyCode;
  onLocale: (l: LocaleCode) => void;
  onCurrency: (c: CurrencyCode) => void;
  onOpenMobile: () => void;
}) {
  const { title, subtitle } = coreSectionMeta[section];
  const [openLang, setOpenLang] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button type="button" onClick={onOpenMobile} aria-label="Open menu" className="cursor-pointer rounded-lg p-2 text-navy-700 hover:bg-navy-100 lg:hidden">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-navy-900">{title}</h1>
          <p className="truncate text-xs text-navy-500">{subtitle}</p>
        </div>

        {/* Currency selector */}
        <label htmlFor="currency-select" className="sr-only">Currency</label>
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => onCurrency(e.target.value as CurrencyCode)}
          className="cursor-pointer rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-sm font-semibold text-accent-600 focus:border-accent-400"
        >
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
        </select>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenLang((v) => !v)}
            aria-label="Change language"
            aria-expanded={openLang}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 px-2.5 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            {locale.toUpperCase()}
          </button>
          {openLang && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenLang(false)} aria-hidden="true" />
              <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-xl">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => { onLocale(l.code); setOpenLang(false); }}
                    className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-navy-50 ${locale === l.code ? "font-semibold text-accent-600" : "text-navy-700"}`}
                  >
                    {l.label}
                    <span className="text-xs text-navy-400">{l.nativeLabel}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <NotificationBell />
      </div>
    </header>
  );
}

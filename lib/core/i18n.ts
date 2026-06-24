import type { CurrencyCode, LocaleCode } from "./types";

/**
 * Internationalization layer — locale & currency configuration plus a tiny
 * dictionary scaffold. Structured so a full i18n library (next-intl, etc.)
 * can drop in without changing component call sites.
 */

export interface LocaleConfig {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}

export const LOCALES: LocaleConfig[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", dir: "ltr" },
];

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  // Mock conversion rates relative to USD base.
  rateFromUsd: number;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", label: "US Dollar", rateFromUsd: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rateFromUsd: 0.92 },
  { code: "MAD", symbol: "د.م.", label: "Moroccan Dirham", rateFromUsd: 9.95 },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", rateFromUsd: 7.18 },
];

export function getCurrency(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Convert a USD base amount into the target currency and format it. */
export function formatMoney(usdAmount: number, code: CurrencyCode): string {
  const c = getCurrency(code);
  const value = usdAmount * c.rateFromUsd;
  const formatted = value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${c.symbol}${formatted}`;
}

/** Minimal UI dictionary scaffold. Extend per-locale for full coverage. */
export const dictionary: Record<LocaleCode, Record<string, string>> = {
  en: { workspace: "Operations Workspace", language: "Language", currency: "Currency" },
  ar: { workspace: "مساحة العمليات", language: "اللغة", currency: "العملة" },
  fr: { workspace: "Espace Opérations", language: "Langue", currency: "Devise" },
  zh: { workspace: "运营工作区", language: "语言", currency: "货币" },
};

export function t(locale: LocaleCode, key: string): string {
  return dictionary[locale]?.[key] ?? dictionary.en[key] ?? key;
}

"use client";

import { useEffect, useState } from "react";
import { Globe, LayoutDashboard, LogIn, Menu, Ship, X } from "lucide-react";
import { content } from "@/lib/content";
import { useSession } from "@/lib/auth/useSession";

export function Navbar() {
  const t = content.en.nav;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const session = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        aria-label="Main navigation"
        className={`container-page flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors duration-300 sm:px-6 ${
          scrolled
            ? "border-navy-100 bg-white/90 shadow-card backdrop-blur-md"
            : "border-white/15 bg-navy-950/40 backdrop-blur-md"
        }`}
      >
        {/* Brand */}
        <a
          href="#home"
          className="flex items-center gap-2.5 font-bold"
          aria-label="MCG Global home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
            <Ship className="h-5 w-5" aria-hidden="true" />
          </span>
          <span
            className={`text-lg tracking-tight transition-colors ${
              scrolled ? "text-navy-900" : "text-white"
            }`}
          >
            MCG <span className="text-accent-500">Global</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {t.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? "text-navy-700 hover:bg-navy-50 hover:text-navy-900"
                    : "text-navy-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            aria-label="Change language"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              scrolled
                ? "text-navy-700 hover:bg-navy-50"
                : "text-navy-100 hover:bg-white/10"
            }`}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            EN
          </button>
          {session.isAuthenticated && session.dashboardPath ? (
            <a
              href={session.dashboardPath}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-600"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              لوحة التحكم
              <span className="text-xs opacity-80">Dashboard</span>
            </a>
          ) : (
            <a
              href="/auth"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-600"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              تسجيل الدخول
              <span className="text-xs opacity-80">Sign In</span>
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className={`cursor-pointer rounded-lg p-2 transition-colors duration-200 lg:hidden ${
            scrolled
              ? "text-navy-900 hover:bg-navy-50"
              : "text-white hover:bg-white/10"
          }`}
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="container-page mt-2 rounded-2xl border border-navy-100 bg-white p-3 shadow-card-hover lg:hidden"
        >
          <ul className="flex flex-col">
            {t.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors duration-200 hover:bg-navy-50 hover:text-navy-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={session.isAuthenticated && session.dashboardPath ? session.dashboardPath : "/auth"}
            onClick={() => setOpen(false)}
            className="mt-2 block cursor-pointer rounded-xl bg-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600"
          >
            {session.isAuthenticated ? "لوحة التحكم · Dashboard" : "تسجيل الدخول · Sign In"}
          </a>
        </div>
      )}
    </header>
  );
}

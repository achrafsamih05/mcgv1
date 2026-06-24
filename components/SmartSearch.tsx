"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { content } from "@/lib/content";

export function SmartSearch() {
  const t = content.en.search;
  const [type, setType] = useState(t.types[0]);
  const [query, setQuery] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: wire to /search?type=<type>&q=<query> when backend is ready.
    console.log("search:", { type, query });
  };

  return (
    <div className="container-page relative z-10 -mt-12 sm:-mt-14">
      <form
        onSubmit={onSubmit}
        role="search"
        aria-label="Cross-platform search"
        className="rounded-2xl border border-navy-100 bg-white p-2.5 shadow-card-hover"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* Type filter */}
          <div className="relative md:w-52 md:shrink-0">
            <label htmlFor="search-type" className="sr-only">
              Search category
            </label>
            <select
              id="search-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 pr-10 text-sm font-medium text-navy-800 transition-colors duration-200 hover:bg-navy-100 focus:border-accent-400"
            >
              {t.types.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500"
              aria-hidden="true"
            />
          </div>

          {/* Input */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400"
              aria-hidden="true"
            />
            <label htmlFor="search-input" className="sr-only">
              {t.placeholder}
            </label>
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="w-full rounded-xl border border-navy-100 bg-white py-3 pl-12 pr-4 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-200 focus:border-accent-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600 md:shrink-0"
          >
            <Search className="h-4 w-4 md:hidden" aria-hidden="true" />
            {t.button}
          </button>
        </div>

        {/* Popular suggestions */}
        <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-3 text-xs">
          <span className="font-medium text-navy-500">{t.popular}</span>
          {t.popularItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="cursor-pointer rounded-full border border-navy-100 bg-navy-50 px-3 py-1 font-medium text-navy-600 transition-colors duration-200 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
            >
              {item}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

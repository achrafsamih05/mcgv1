"use client";

import { useState } from "react";
import { Building2, Package, Search, Truck, Workflow } from "lucide-react";
import { runFederatedSearch } from "@/lib/core/data";
import type { FederatedSearchResults } from "@/lib/core/types";
import { Badge, Panel } from "../ui";

export function SearchSection() {
  const [query, setQuery] = useState("Toyota");
  const [results, setResults] = useState<FederatedSearchResults>(() => runFederatedSearch("Toyota"));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(runFederatedSearch(query));
  };

  const total =
    results.items.length + results.corporations.length + results.operations.length + results.vehicles.length;

  return (
    <div className="space-y-5">
      <Panel className="p-4">
        <form onSubmit={submit} role="search" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" aria-hidden="true" />
            <label htmlFor="fed-search" className="sr-only">Federated search</label>
            <input
              id="fed-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "Toyota"…'
              className="w-full rounded-lg border border-navy-200 py-2.5 pl-11 pr-3 text-sm focus:border-accent-400"
            />
          </div>
          <button type="submit" className="cursor-pointer rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600">
            Search
          </button>
        </form>
        <p className="mt-2 px-1 text-xs text-navy-500">{total} results across 4 entity groups</p>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Group title="Match Items" icon={<Package className="h-4 w-4" />} count={results.items.length}>
          {results.items.map((it) => (
            <Row key={it.id} primary={it.name} secondary={it.category} trailing={<span className="font-semibold text-accent-600">{it.price}</span>} />
          ))}
        </Group>

        <Group title="Counterpart Corporations" icon={<Building2 className="h-4 w-4" />} count={results.corporations.length}>
          {results.corporations.map((c) => (
            <Row key={c.id} primary={c.name} secondary={c.country} />
          ))}
        </Group>

        <Group title="Linked Active Operations" icon={<Workflow className="h-4 w-4" />} count={results.operations.length}>
          {results.operations.map((o) => (
            <Row key={o.id} primary={o.ref} secondary={o.id} trailing={<Badge tone="info">{o.stage}</Badge>} />
          ))}
        </Group>

        <Group title="Fleet Transport Vehicles" icon={<Truck className="h-4 w-4" />} count={results.vehicles.length}>
          {results.vehicles.map((v) => (
            <Row key={v.id} primary={v.name} secondary={`${v.type} · ${v.city}`} />
          ))}
        </Group>
      </div>
    </div>
  );
}

function Group({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">{icon}{title}</h2>
        <Badge tone="neutral">{count}</Badge>
      </div>
      <ul className="divide-y divide-navy-100">
        {count === 0 ? <li className="px-5 py-6 text-center text-sm text-navy-400">No matches</li> : children}
      </ul>
    </Panel>
  );
}

function Row({ primary, secondary, trailing }: { primary: string; secondary: string; trailing?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-navy-900">{primary}</p>
        <p className="truncate text-xs text-navy-500">{secondary}</p>
      </div>
      {trailing}
    </li>
  );
}

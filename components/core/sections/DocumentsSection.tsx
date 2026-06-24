"use client";

import { useMemo, useState } from "react";
import { FileImage, FileText, FileType, Search, Upload } from "lucide-react";
import type {
  DocumentEntity,
  DocumentFormat,
  ManagedDocument,
} from "@/lib/core/types";
import { documents as seed } from "@/lib/core/data";
import { Badge, Button, Panel, PanelHeader, type Tone } from "../ui";

const formatIcon: Record<DocumentFormat, typeof FileText> = {
  PDF: FileText,
  Image: FileImage,
  DOCX: FileType,
};

const entityTone: Record<DocumentEntity, Tone> = {
  Order: "info",
  Deal: "accent",
  Shipment: "success",
};

export function DocumentsSection() {
  const [docs] = useState<ManagedDocument[]>(seed);
  const [entity, setEntity] = useState<DocumentEntity | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      docs.filter(
        (d) =>
          (entity === "All" || d.entityType === entity) &&
          (d.name.toLowerCase().includes(query.toLowerCase()) || d.kind.toLowerCase().includes(query.toLowerCase()))
      ),
    [docs, entity, query]
  );

  return (
    <Panel>
      <PanelHeader
        title="Documents Center"
        description={`${filtered.length} compliance assets · polymorphically linked to Orders, Deals & Shipments`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="doc-search" className="sr-only">Search documents</label>
              <input id="doc-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files…" className="w-48 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm focus:border-accent-400" />
            </div>
            <select aria-label="Filter by entity" value={entity} onChange={(e) => setEntity(e.target.value as DocumentEntity | "All")} className="cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400">
              {["All", "Order", "Deal", "Shipment"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button><Upload className="h-4 w-4" aria-hidden="true" />Upload</Button>
          </div>
        }
      />

      {/* Ingestion placeholder with format filtering */}
      <div className="border-b border-navy-100 p-5">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-200 bg-navy-50 py-8 text-center">
          <Upload className="h-7 w-7 text-navy-400" aria-hidden="true" />
          <p className="text-sm font-medium text-navy-700">Drop files to ingest</p>
          <p className="text-xs text-navy-400">Accepted: PDF, Images (JPG/PNG), DOCX · Invoices, Packing Lists, Bills of Lading, Legal Contracts</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">File</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Linked Entity</th>
              <th className="px-5 py-3 font-semibold">Uploaded By</th>
              <th className="px-5 py-3 font-semibold">Size</th>
              <th className="px-5 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((d) => {
              const Icon = formatIcon[d.format];
              return (
                <tr key={d.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                      <span className="font-medium text-navy-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge tone="neutral">{d.kind}</Badge></td>
                  <td className="px-5 py-3">
                    <Badge tone={entityTone[d.entityType]}>{d.entityType} · {d.entityId}</Badge>
                  </td>
                  <td className="px-5 py-3 text-navy-700">{d.uploadedBy}</td>
                  <td className="px-5 py-3 text-navy-600">{(d.sizeKb / 1024).toFixed(2)} MB</td>
                  <td className="px-5 py-3 text-navy-600">{d.uploadedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

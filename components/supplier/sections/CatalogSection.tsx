"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Pencil, Plus, Search, Trash2, Video } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  type B2BProduct,
  type ProductCategory,
} from "@/lib/supplier/types";
import { can, scopeToTenant, type SupplierSession } from "@/lib/supplier/rbac";
import { Badge, Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

const statusTone: Record<B2BProduct["status"], Parameters<typeof Badge>[0]["tone"]> = {
  Live: "success",
  Draft: "warning",
  Hidden: "neutral",
};

type FormState = {
  name: string;
  category: ProductCategory;
  description: string;
  videoUrl: string;
  priceMin: string;
  priceMax: string;
  moq: string;
  leadTimeDays: string;
};

const emptyForm: FormState = {
  name: "",
  category: "Cars & Vehicles",
  description: "",
  videoUrl: "",
  priceMin: "",
  priceMax: "",
  moq: "",
  leadTimeDays: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

export function CatalogSection({
  session,
  seedProducts,
}: {
  session: SupplierSession;
  seedProducts: B2BProduct[];
}) {
  // RBAC: only ever hold this tenant's own products in state.
  const [products, setProducts] = useState<B2BProduct[]>(() =>
    scopeToTenant(session, seedProducts)
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canCreate = can(session, "catalog:create");
  const canDelete = can(session, "catalog:delete");

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query]
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (p: B2BProduct) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      videoUrl: p.videoUrl ?? "",
      priceMin: String(p.priceMin),
      priceMax: String(p.priceMax),
      moq: String(p.moq),
      leadTimeDays: String(p.leadTimeDays),
    });
    setErrors({});
    setOpen(true);
  };

  // Lightweight Zod-style validation map (kept dependency-free).
  const validate = (f: FormState): Errors => {
    const e: Errors = {};
    if (!f.name.trim()) e.name = "Product name is required.";
    if (!f.description.trim()) e.description = "Description is required.";
    const min = Number(f.priceMin);
    const max = Number(f.priceMax);
    if (!f.priceMin || min <= 0) e.priceMin = "Enter a valid min price.";
    if (!f.priceMax || max <= 0) e.priceMax = "Enter a valid max price.";
    if (min && max && max < min) e.priceMax = "Max must be ≥ min price.";
    if (!f.moq || Number(f.moq) <= 0) e.moq = "MOQ must be greater than 0.";
    if (!f.leadTimeDays || Number(f.leadTimeDays) <= 0) e.leadTimeDays = "Enter lead time in days.";
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const base = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      videoUrl: form.videoUrl.trim() || undefined,
      priceMin: Number(form.priceMin),
      priceMax: Number(form.priceMax),
      moq: Number(form.moq),
      leadTimeDays: Number(form.leadTimeDays),
    };

    if (editId) {
      setProducts((prev) => prev.map((p) => (p.id === editId ? { ...p, ...base } : p)));
    } else {
      const newProduct: B2BProduct = {
        id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierId: session.supplierId, // always own tenant
        images: 0,
        status: "Draft",
        createdAt: new Date().toISOString().slice(0, 10),
        ...base,
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const field = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Panel>
      <PanelHeader
        title="Your Listings"
        description={`${filtered.length} products`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
              <label htmlFor="catalog-search" className="sr-only">Search products</label>
              <input
                id="catalog-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-52 rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm placeholder:text-navy-400 focus:border-accent-400"
              />
            </div>
            <Button onClick={openCreate} disabled={!canCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />Add Product
            </Button>
          </div>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Unit Price</th>
              <th className="px-5 py-3 font-semibold">MOQ</th>
              <th className="px-5 py-3 font-semibold">Lead Time</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-navy-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400">
                      <ImageIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="font-semibold text-navy-900">{p.name}</div>
                      <div className="text-xs text-navy-500">{p.id} · {p.images} images</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-navy-700">{p.category}</td>
                <td className="px-5 py-3 font-semibold text-accent-600">${p.priceMin}–${p.priceMax}</td>
                <td className="px-5 py-3 text-navy-700">{p.moq.toLocaleString()}</td>
                <td className="px-5 py-3 text-navy-700">{p.leadTimeDays} days</td>
                <td className="px-5 py-3"><Badge tone={statusTone[p.status]}>{p.status}</Badge></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />Edit
                    </Button>
                    <Button variant="danger" size="sm" disabled={!canDelete} onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-navy-400">No products yet. Add your first listing.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Product" : "Add Product"} size="lg">
        <form onSubmit={submit} className="space-y-5" noValidate>
          {/* Core metadata */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Core Metadata</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Product Name" error={errors.name} required>
                <input
                  value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
                />
              </FormField>
              <FormField label="Category" required>
                <select
                  value={form.category}
                  onChange={(e) => field("category", e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
                >
                  {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Detailed Description" error={errors.description} required className="mt-4">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => field("description", e.target.value)}
                placeholder="Rich product details, specifications, materials…"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400"
              />
            </FormField>
          </div>

          {/* Media */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Media Gallery</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 py-6 text-sm text-navy-500">
                <ImageIcon className="h-5 w-5" aria-hidden="true" />
                Upload product images
              </div>
              <FormField label="Video URL (optional)">
                <div className="relative">
                  <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                  <input
                    value={form.videoUrl}
                    onChange={(e) => field("videoUrl", e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-navy-200 py-2 pl-9 pr-3 text-sm focus:border-accent-400"
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* Trade terms */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-navy-700">B2B Trade Terms</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FormField label="Min Price ($)" error={errors.priceMin} required>
                <input type="number" value={form.priceMin} onChange={(e) => field("priceMin", e.target.value)} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </FormField>
              <FormField label="Max Price ($)" error={errors.priceMax} required>
                <input type="number" value={form.priceMax} onChange={(e) => field("priceMax", e.target.value)} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </FormField>
              <FormField label="MOQ" error={errors.moq} required>
                <input type="number" value={form.moq} onChange={(e) => field("moq", e.target.value)} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </FormField>
              <FormField label="Lead (days)" error={errors.leadTimeDays} required>
                <input type="number" value={form.leadTimeDays} onChange={(e) => field("leadTimeDays", e.target.value)} className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-accent-400" />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{editId ? "Save Changes" : "Create Listing"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <p className="text-sm text-navy-600">This removes the listing from your catalog. This action cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />Delete
          </Button>
        </div>
      </Modal>
    </Panel>
  );
}

function FormField({
  label,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-navy-800">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

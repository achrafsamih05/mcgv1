"use client";

/**
 * Supplier Catalog — LIVE supplier_products management.
 *
 * Realtime list of the supplier's own catalog with live INSERT (modal form)
 * and DELETE operations, all scoped to auth.uid() via RLS. Updates flash in
 * instantly through the `supplier_products` realtime channel.
 *
 * Brand tokens: accent orange (#F97316) primary actions and price emphasis.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase/client";
import {
  deleteSupplierProduct,
  fetchSupplierProducts,
  insertSupplierProduct,
} from "@/lib/supabase/queries";
import type { SupplierProduct } from "@/lib/supabase/database.types";
import { Button, Panel, PanelHeader } from "../ui";
import { Modal } from "@/components/admin/ui/Modal";

type ProductForm = {
  name: string;
  description: string;
  moq: string;
  priceRange: string;
  imageUrl: string;
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

const emptyForm: ProductForm = {
  name: "",
  description: "",
  moq: "",
  priceRange: "",
  imageUrl: "",
};

export function LiveCatalogSection({ supplierId }: { supplierId: string | null }) {
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dbRef = useRef(SUPABASE_CONFIGURED ? createClient() : null);

  const refresh = useCallback(async () => {
    const db = dbRef.current;
    if (!db || !supplierId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetchSupplierProducts(db, supplierId);
    if (res.error) setFeedError(res.error);
    else {
      setFeedError(null);
      setProducts(res.data ?? []);
    }
    setLoading(false);
  }, [supplierId]);

  useEffect(() => {
    const db = dbRef.current;
    if (!db || !supplierId) {
      setLoading(false);
      return;
    }
    void refresh();

    const channel = db
      .channel(`supplier:catalog:${supplierId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "supplier_products", filter: `supplier_id=eq.${supplierId}` },
        () => void refresh()
      )
      .subscribe();

    return () => {
      void db.removeChannel(channel);
    };
  }, [supplierId, refresh]);

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setSubmitError(null);
    setOpen(true);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Product name required";
    if (!form.priceRange.trim()) e.priceRange = "Price range required";
    const moq = Number(form.moq);
    if (!form.moq || !Number.isInteger(moq) || moq < 1) e.moq = "Whole number ≥ 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    const db = dbRef.current;
    if (!db || !supplierId) {
      setSubmitError("You must be signed in to add a product.");
      return;
    }

    setSubmitting(true);
    const res = await insertSupplierProduct(db, {
      supplier_id: supplierId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      moq: Number(form.moq),
      price_range: form.priceRange.trim(),
      image_url: form.imageUrl.trim() || null,
    });
    setSubmitting(false);

    if (res.error) {
      setSubmitError(res.error);
      return;
    }
    setOpen(false);
  };

  const remove = async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    setDeletingId(id);
    await deleteSupplierProduct(db, id);
    setDeletingId(null);
  };

  if (!SUPABASE_CONFIGURED) {
    return (
      <Panel>
        <PanelHeader title="Product Catalog" description="Live catalog" />
        <div className="p-10 text-center text-sm text-navy-500">
          Connect Supabase to manage your live product catalog.
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title="Product Catalog"
        description={`${products.length} live ${products.length === 1 ? "product" : "products"}`}
        action={
          <Button onClick={openCreate} disabled={!supplierId}>
            <Plus className="h-4 w-4" aria-hidden="true" />Add Product
          </Button>
        }
      />

      {feedError && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{feedError}</p>
      )}

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center gap-2 p-12 text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading catalog…
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-navy-400">
          <Package className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-medium">No products yet. Add your first listing.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Price Range</th>
                <th className="px-5 py-3 font-semibold">MOQ</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400">
                        <ImageIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="font-semibold text-navy-900">{p.name}</div>
                        {p.description && <div className="max-w-[320px] truncate text-xs text-navy-500">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-accent-600">{p.price_range ?? "—"}</td>
                  <td className="px-5 py-3 text-navy-700">{(p.moq ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Button variant="danger" size="sm" disabled={deletingId === p.id} onClick={() => remove(p.id)}>
                        {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Product" size="lg">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Product Name" error={errors.name} required>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass(!!errors.name)} placeholder="e.g. OEM Ceramic Brake Pads" />
          </Field>
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass(false)} placeholder="Materials, specs, certifications…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price Range" error={errors.priceRange} required>
              <input value={form.priceRange} onChange={(e) => set("priceRange", e.target.value)} className={inputClass(!!errors.priceRange)} placeholder="$8 – $14 / unit" />
            </Field>
            <Field label="MOQ" error={errors.moq} required>
              <input type="number" value={form.moq} onChange={(e) => set("moq", e.target.value)} className={inputClass(!!errors.moq)} placeholder="500" />
            </Field>
          </div>
          <Field label="Image URL (optional)">
            <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className={inputClass(false)} placeholder="https://…" />
          </Field>

          {submitError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{submitError}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {submitting ? "Saving…" : "Create Listing"}
            </Button>
          </div>
        </form>
      </Modal>
    </Panel>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:border-accent-400 ${
    hasError ? "border-red-300" : "border-navy-200"
  }`;
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy-800">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

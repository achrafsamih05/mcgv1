/**
 * Centralized, fully-typed data-access layer over the Supabase client.
 *
 * Every dashboard reads/writes the relational backend through these helpers
 * rather than touching the raw client inline. This keeps RLS-aware queries,
 * relational joins, and mutation payloads in one place — no `any`, no mock
 * arrays. All functions accept a typed `SupabaseClient<Database>` so they work
 * from both Browser (client.ts) and Server (server.ts) contexts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Deal,
  Product,
  ProductWithSupplier,
  Profile,
  Quotation,
  QuotationWithSupplier,
  Rfq,
  VerificationStatus,
  Warehouse,
  WarehouseWithHost,
  SupplierProduct,
  Vehicle,
  VehicleStatus,
  Shipment,
  Notification,
  Dispute,
  DisputeStatus,
  DisputeWithParties,
  Review,
  ReviewWithParties,
  SystemLog,
  SystemLogInsert,
  Wallet,
  CmsContent,
  ModerationFlagWithParties,
  PlatformSetting,
} from "./database.types";

export type DB = SupabaseClient<Database>;

/** Uniform result envelope so callers can branch on data | error without throws. */
export interface Result<T> {
  data: T | null;
  error: string | null;
}

function ok<T>(data: T): Result<T> {
  return { data, error: null };
}
function fail<T>(error: string): Result<T> {
  return { data: null, error };
}

// ===========================================================================
//  Loop A — Discovery feeds (APPROVED-only, enforced by RLS + explicit joins)
// ===========================================================================

/**
 * Approved suppliers for the public Home Page and Buyer discovery feed.
 * RLS already hides non-APPROVED profiles from anon/buyer sessions; the
 * explicit filters make intent clear and keep results correct for admins too.
 */
export async function fetchApprovedSuppliers(db: DB): Promise<Result<Profile[]>> {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("role", "SUPPLIER")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** Approved products joined to their owning (approved) supplier profile. */
export async function fetchApprovedProducts(
  db: DB
): Promise<Result<ProductWithSupplier[]>> {
  const { data, error } = await db
    .from("products")
    .select("*, profiles!products_supplier_id_fkey(id, full_name, company_name, status)")
    .eq("profiles.status", "APPROVED")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok((data as unknown as ProductWithSupplier[]) ?? []);
}

/** Approved warehouses joined to their owning (approved) host profile. */
export async function fetchApprovedWarehouses(
  db: DB
): Promise<Result<WarehouseWithHost[]>> {
  const { data, error } = await db
    .from("warehouses")
    .select("*, profiles!warehouses_host_id_fkey(id, full_name, company_name, status)")
    .eq("profiles.status", "APPROVED")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok((data as unknown as WarehouseWithHost[]) ?? []);
}

// ===========================================================================
//  Loop A — Admin approval funnel
// ===========================================================================

/** All profiles awaiting review, oldest first (Req 8.1). */
export async function fetchPendingProfiles(db: DB): Promise<Result<Profile[]>> {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });
  return error ? fail(error.message) : ok(data ?? []);
}

/**
 * Transition a profile's verification status. The `.eq("status","PENDING")`
 * guard makes the update a no-op when the row was already processed (Req 8.7);
 * callers detect that case via an empty returned array.
 */
export async function setProfileStatus(
  db: DB,
  profileId: string,
  status: Exclude<VerificationStatus, "PENDING">
): Promise<Result<Profile>> {
  const { data, error } = await db
    .from("profiles")
    .update({ status })
    .eq("id", profileId)
    .eq("status", "PENDING")
    .select()
    .maybeSingle();
  if (error) return fail(error.message);
  if (!data) return fail("Profile already processed or not found.");
  return ok(data);
}

// ===========================================================================
//  Loop A — Commercial account asset registration
// ===========================================================================

export async function insertWarehouse(
  db: DB,
  payload: {
    host_id: string;
    title: string;
    city: string | null;
    total_area_m2: number | null;
    available_area_m2: number | null;
    price_per_m2_monthly: number | null;
  }
): Promise<Result<Warehouse>> {
  const { data, error } = await db.from("warehouses").insert(payload).select().single();
  return error ? fail(error.message) : ok(data);
}

export async function upsertDriverMetadata(
  db: DB,
  payload: {
    id: string;
    license_number: string | null;
    vehicle: Database["public"]["Enums"]["vehicle_type"] | null;
    max_weight_capacity_kg: number | null;
  }
): Promise<Result<null>> {
  const { error } = await db
    .from("drivers_metadata")
    .upsert({ ...payload, created_at: new Date().toISOString() });
  return error ? fail(error.message) : ok(null);
}

export async function insertProduct(
  db: DB,
  payload: {
    supplier_id: string;
    title: string;
    description: string | null;
    price_range: string | null;
    moq: number | null;
    lead_time: string | null;
    images?: string[];
  }
): Promise<Result<Product>> {
  const { data, error } = await db.from("products").insert(payload).select().single();
  return error ? fail(error.message) : ok(data);
}

// ===========================================================================
//  Loop B — RFQ → Quotation → Deal pipeline
// ===========================================================================

/** Buyer creates a sourcing request (Req 10). */
export async function insertRfq(
  db: DB,
  payload: {
    buyer_id: string;
    product_title: string;
    category: string | null;
    specifications: string | null;
    target_budget: string | null;
    quantity: number | null;
  }
): Promise<Result<Rfq>> {
  const { data, error } = await db.from("rfqs").insert(payload).select().single();
  return error ? fail(error.message) : ok(data);
}

/** Count of all RFQs submitted by a specific buyer (head-only, exact count). */
export async function countBuyerRfqs(
  db: DB,
  buyerId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("rfqs")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", buyerId);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of active (non-cancelled, non-completed) deals for a buyer. */
export async function countBuyerActiveDeals(
  db: DB,
  buyerId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", buyerId)
    .not("status", "in", "(COMPLETED,CANCELLED)");
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of OPEN RFQs for a buyer (awaiting quotations). */
export async function countBuyerOpenRfqs(
  db: DB,
  buyerId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("rfqs")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", buyerId)
    .eq("status", "OPEN");
  return error ? fail(error.message) : ok(count ?? 0);
}

/** A buyer's own RFQs, newest first. */
export async function fetchBuyerRfqs(db: DB, buyerId: string): Promise<Result<Rfq[]>> {
  const { data, error } = await db
    .from("rfqs")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** The active RFQ pipeline a supplier can quote against (Req 11.1). */
export async function fetchOpenRfqs(db: DB): Promise<Result<Rfq[]>> {
  const { data, error } = await db
    .from("rfqs")
    .select("*")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** Supplier submits an offer against an RFQ (Req 11.2). */
export async function insertQuotation(
  db: DB,
  payload: {
    rfq_id: string;
    supplier_id: string;
    unit_price: number;
    shipping_lead_time: number;
    notes: string | null;
  }
): Promise<Result<Quotation>> {
  // Populate canonical (unit_price/shipping_lead_time/notes) AND legacy
  // (offered_price/dynamic_lead_time) columns so the accept_deal RPC and the
  // Importer-side views both resolve correctly.
  const { data, error } = await db
    .from("quotations")
    .insert({
      rfq_id: payload.rfq_id,
      supplier_id: payload.supplier_id,
      unit_price: payload.unit_price,
      shipping_lead_time: payload.shipping_lead_time,
      notes: payload.notes,
      offered_price: payload.unit_price,
      dynamic_lead_time: String(payload.shipping_lead_time),
      status: "PENDING",
    })
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

/** Quotations for an RFQ, joined to the offering supplier. */
export async function fetchQuotationsForRfq(
  db: DB,
  rfqId: string
): Promise<Result<QuotationWithSupplier[]>> {
  const { data, error } = await db
    .from("quotations")
    .select("*, profiles!quotations_supplier_id_fkey(id, full_name, company_name)")
    .eq("rfq_id", rfqId)
    .order("offered_price", { ascending: true });
  return error ? fail(error.message) : ok((data as unknown as QuotationWithSupplier[]) ?? []);
}

/** Accept a quotation atomically via the SECURITY DEFINER RPC (Req 12). */
export async function acceptDeal(db: DB, quoteId: string): Promise<Result<Deal>> {
  const { data, error } = await db.rpc("accept_deal", { p_quote_id: quoteId });
  return error ? fail(error.message) : ok(data as Deal);
}

/** Deals visible to the current user (buyer/supplier/admin per RLS). */
export async function fetchDeals(db: DB): Promise<Result<Deal[]>> {
  const { data, error } = await db
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** Advance / set a deal's lifecycle status (Req 13 stepper source). */
export async function setDealStatus(
  db: DB,
  dealId: string,
  status: Database["public"]["Enums"]["deal_status"]
): Promise<Result<Deal>> {
  const { data, error } = await db
    .from("deals")
    .update({ status })
    .eq("id", dealId)
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

// ===========================================================================
//  Supplier (Manufacturer) — catalog + metrics
// ===========================================================================

/** A supplier's own catalog, newest first. */
export async function fetchSupplierProducts(
  db: DB,
  supplierId: string
): Promise<Result<SupplierProduct[]>> {
  const { data, error } = await db
    .from("supplier_products")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** Insert a catalog product owned by the signed-in supplier. */
export async function insertSupplierProduct(
  db: DB,
  payload: {
    supplier_id: string;
    name: string;
    description: string | null;
    moq: number | null;
    price_range: string | null;
    image_url: string | null;
  }
): Promise<Result<SupplierProduct>> {
  const { data, error } = await db
    .from("supplier_products")
    .insert(payload)
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

/** Delete a catalog product (RLS enforces supplier ownership). */
export async function deleteSupplierProduct(
  db: DB,
  productId: string
): Promise<Result<null>> {
  const { error } = await db.from("supplier_products").delete().eq("id", productId);
  return error ? fail(error.message) : ok(null);
}

/** Count of catalog products owned by a supplier. */
export async function countSupplierProducts(
  db: DB,
  supplierId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("supplier_products")
    .select("*", { count: "exact", head: true })
    .eq("supplier_id", supplierId);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of quotations a supplier has sent (active = PENDING). */
export async function countSupplierActiveQuotations(
  db: DB,
  supplierId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("quotations")
    .select("*", { count: "exact", head: true })
    .eq("supplier_id", supplierId)
    .eq("status", "PENDING");
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of won deals for a supplier. */
export async function countSupplierWonDeals(
  db: DB,
  supplierId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("supplier_id", supplierId);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** OPEN RFQs available for a supplier to bid on. */
export async function fetchOpenRfqsForBidding(db: DB): Promise<Result<Rfq[]>> {
  const { data, error } = await db
    .from("rfqs")
    .select("*")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

// ===========================================================================
//  Logistics / Driver — fleet (vehicles) + shipments
// ===========================================================================

/** A carrier's own fleet, newest first. */
export async function fetchCarrierVehicles(
  db: DB,
  carrierId: string
): Promise<Result<Vehicle[]>> {
  const { data, error } = await db
    .from("vehicles")
    .select("*")
    .eq("carrier_id", carrierId)
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** Register a vehicle in the carrier's fleet. */
export async function insertVehicle(
  db: DB,
  payload: {
    carrier_id: string;
    plate_number: string | null;
    vehicle_type: string | null;
    max_weight_capacity: number | null;
    current_status?: VehicleStatus;
  }
): Promise<Result<Vehicle>> {
  const { data, error } = await db.from("vehicles").insert(payload).select().single();
  return error ? fail(error.message) : ok(data);
}

/** Update a vehicle's operational status (RLS enforces ownership). */
export async function setVehicleStatus(
  db: DB,
  vehicleId: string,
  status: VehicleStatus
): Promise<Result<Vehicle>> {
  const { data, error } = await db
    .from("vehicles")
    .update({ current_status: status })
    .eq("id", vehicleId)
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

/** Delete a vehicle (RLS enforces carrier ownership). */
export async function deleteVehicle(db: DB, vehicleId: string): Promise<Result<null>> {
  const { error } = await db.from("vehicles").delete().eq("id", vehicleId);
  return error ? fail(error.message) : ok(null);
}

/** Shipments assigned to a carrier, most recently updated first. */
export async function fetchCarrierShipments(
  db: DB,
  carrierId: string
): Promise<Result<Shipment[]>> {
  const { data, error } = await db
    .from("shipments")
    .select("*")
    .eq("carrier_id", carrierId)
    .order("updated_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** Advance / set a shipment's supply-chain stage (1..8). */
export async function setShipmentStage(
  db: DB,
  shipmentId: string,
  stage: number,
  statusNotes?: string | null
): Promise<Result<Shipment>> {
  const patch: { current_stage: number; updated_at: string; status_notes?: string | null } = {
    current_stage: stage,
    updated_at: new Date().toISOString(),
  };
  if (statusNotes !== undefined) patch.status_notes = statusNotes;
  const { data, error } = await db
    .from("shipments")
    .update(patch)
    .eq("id", shipmentId)
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

/** Count of a carrier's registered vehicles. */
export async function countCarrierVehicles(
  db: DB,
  carrierId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", carrierId);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of active trips (shipments not yet at the final stage 8). */
export async function countCarrierActiveTrips(
  db: DB,
  carrierId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", carrierId)
    .lt("current_stage", 8);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of completed shipments (stage 8). */
export async function countCarrierCompletedShipments(
  db: DB,
  carrierId: string
): Promise<Result<number>> {
  const { count, error } = await db
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("carrier_id", carrierId)
    .eq("current_stage", 8);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of pending cargo offers (unassigned shipments awaiting a carrier). */
export async function countPendingCargoOffers(db: DB): Promise<Result<number>> {
  const { count, error } = await db
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .is("carrier_id", null);
  return error ? fail(error.message) : ok(count ?? 0);
}

// ===========================================================================
//  Super Admin — global, cross-tenant aggregates & oversight
// ===========================================================================

/** Count of profiles for a given role (admin global view). */
export async function countProfilesByRole(
  db: DB,
  role: Database["public"]["Enums"]["platform_role"]
): Promise<Result<number>> {
  const { count, error } = await db
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", role);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of RFQs in a given status (admin global view). */
export async function countRfqsByStatus(
  db: DB,
  status: Database["public"]["Enums"]["rfq_status"]
): Promise<Result<number>> {
  const { count, error } = await db
    .from("rfqs")
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Count of shipments at the final delivered stage (8) platform-wide. */
export async function countCompletedShipmentsGlobal(db: DB): Promise<Result<number>> {
  const { count, error } = await db
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("current_stage", 8);
  return error ? fail(error.message) : ok(count ?? 0);
}

/** Sum of gross_valuation across all deals — the platform financial run-rate. */
export async function fetchPlatformRunRate(db: DB): Promise<Result<number>> {
  const { data, error } = await db.from("deals").select("gross_valuation");
  if (error) return fail(error.message);
  const total = (data ?? []).reduce(
    (sum, row) => sum + (row.gross_valuation ?? 0),
    0
  );
  return ok(total);
}

/** All shipments across every tenant, most recently updated first. */
export async function fetchAllShipments(db: DB): Promise<Result<Shipment[]>> {
  const { data, error } = await db
    .from("shipments")
    .select("*")
    .order("updated_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

/** All RFQs across every tenant, newest first (admin oversight). */
export async function fetchAllRfqs(db: DB): Promise<Result<Rfq[]>> {
  const { data, error } = await db
    .from("rfqs")
    .select("*")
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

// ===========================================================================
//  Notifications — bell center + broadcast engine
// ===========================================================================

/** Notifications visible to the current user (own + global), newest first. */
export async function fetchNotifications(db: DB): Promise<Result<Notification[]>> {
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  return error ? fail(error.message) : ok(data ?? []);
}

/** Mark a single notification as read. */
export async function markNotificationRead(
  db: DB,
  id: string
): Promise<Result<null>> {
  const { error } = await db.from("notifications").update({ is_read: true }).eq("id", id);
  return error ? fail(error.message) : ok(null);
}

/** Broadcast a global notification to every user (admin broadcast engine). */
export async function broadcastNotification(
  db: DB,
  payload: { title: string; body: string | null; category?: string }
): Promise<Result<Notification>> {
  const { data, error } = await db
    .from("notifications")
    .insert({
      recipient_id: null,
      is_global: true,
      category: payload.category ?? "broadcast",
      title: payload.title,
      body: payload.body,
    })
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

// ===========================================================================
//  Admin — User Directory (paginated, searchable, role-filtered)
// ===========================================================================

export interface DirectoryPage {
  rows: Profile[];
  total: number;
}

export async function fetchProfilesPage(
  db: DB,
  opts: {
    page: number;
    pageSize: number;
    search?: string;
    role?: Database["public"]["Enums"]["platform_role"] | "ALL";
  }
): Promise<Result<DirectoryPage>> {
  const from = opts.page * opts.pageSize;
  const to = from + opts.pageSize - 1;

  let query = db
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (opts.role && opts.role !== "ALL") query = query.eq("role", opts.role);
  if (opts.search && opts.search.trim()) {
    const term = `%${opts.search.trim()}%`;
    query = query.or(`full_name.ilike.${term},company_name.ilike.${term}`);
  }

  const { data, error, count } = await query;
  return error ? fail(error.message) : ok({ rows: data ?? [], total: count ?? 0 });
}

/** All catalog products across suppliers (admin moderation view). */
export async function fetchAllSupplierProducts(
  db: DB
): Promise<Result<SupplierProduct[]>> {
  const { data, error } = await db
    .from("supplier_products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return error ? fail(error.message) : ok(data ?? []);
}

// ===========================================================================
//  Trust & Safety — disputes, reviews, and the audit trail (system_logs)
// ===========================================================================

/** Append an entry to the immutable audit trail. */
export async function insertSystemLog(
  db: DB,
  payload: SystemLogInsert
): Promise<Result<SystemLog>> {
  const { data, error } = await db.from("system_logs").insert(payload).select().single();
  return error ? fail(error.message) : ok(data);
}

/** All disputes joined to creator + target profile names, newest first. */
export async function fetchDisputes(db: DB): Promise<Result<DisputeWithParties[]>> {
  const { data, error } = await db
    .from("disputes")
    .select(
      "*, creator:profiles!disputes_creator_id_fkey(id, full_name, company_name), target:profiles!disputes_target_id_fkey(id, full_name, company_name)"
    )
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok((data as unknown as DisputeWithParties[]) ?? []);
}

/**
 * Settle a dispute: write the verdict + status, then append a system log.
 * The log write is best-effort and never rolls back the settlement.
 */
export async function settleDispute(
  db: DB,
  dispute: Pick<Dispute, "id" | "subject">,
  verdict: string,
  status: Extract<DisputeStatus, "RESOLVED" | "DISMISSED">,
  actor: { id: string | null; name: string | null }
): Promise<Result<Dispute>> {
  const { data, error } = await db
    .from("disputes")
    .update({ admin_verdict: verdict, status, updated_at: new Date().toISOString() })
    .eq("id", dispute.id)
    .select()
    .single();
  if (error) return fail(error.message);

  await insertSystemLog(db, {
    actor_id: actor.id,
    actor_name: actor.name,
    action: status === "RESOLVED" ? "Resolved dispute" : "Dismissed dispute",
    details: { dispute_id: dispute.id, subject: dispute.subject, verdict, status },
  });

  return ok(data);
}

/** All reviews joined to author + target profile names, newest first. */
export async function fetchReviews(db: DB): Promise<Result<ReviewWithParties[]>> {
  const { data, error } = await db
    .from("reviews")
    .select(
      "*, author:profiles!reviews_author_id_fkey(id, full_name, company_name), target:profiles!reviews_target_id_fkey(id, full_name, company_name)"
    )
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok((data as unknown as ReviewWithParties[]) ?? []);
}

/** Toggle a review's flagged state (admin moderation). */
export async function setReviewFlag(
  db: DB,
  reviewId: string,
  flagged: boolean
): Promise<Result<Review>> {
  const { data, error } = await db
    .from("reviews")
    .update({ is_flagged: flagged })
    .eq("id", reviewId)
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

/** Permanently delete a review (admin override). */
export async function deleteReview(db: DB, reviewId: string): Promise<Result<null>> {
  const { error } = await db.from("reviews").delete().eq("id", reviewId);
  return error ? fail(error.message) : ok(null);
}

/** Audit trail feed, newest first. */
export async function fetchSystemLogs(db: DB): Promise<Result<SystemLog[]>> {
  const { data, error } = await db
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return error ? fail(error.message) : ok(data ?? []);
}

// ===========================================================================
//  Financial — wallets ledger
// ===========================================================================

/** All wallet rows (admin financial overview). */
export async function fetchWallets(db: DB): Promise<Result<Wallet[]>> {
  const { data, error } = await db
    .from("wallets")
    .select("*")
    .order("current_balance", { ascending: false });
  return error ? fail(error.message) : ok(data ?? []);
}

export interface FinancialSummary {
  totalBalance: number;
  totalEscrow: number;
  walletCount: number;
}

/** Aggregate escrow + balance totals across the ledger. */
export async function fetchFinancialSummary(db: DB): Promise<Result<FinancialSummary>> {
  const { data, error } = await db.from("wallets").select("current_balance, pending_escrow");
  if (error) return fail(error.message);
  const rows = data ?? [];
  const summary: FinancialSummary = {
    totalBalance: rows.reduce((s, r) => s + Number(r.current_balance ?? 0), 0),
    totalEscrow: rows.reduce((s, r) => s + Number(r.pending_escrow ?? 0), 0),
    walletCount: rows.length,
  };
  return ok(summary);
}

// ===========================================================================
//  Dispute settlement via ACID RPC
// ===========================================================================

export async function processDisputeSettlement(
  db: DB,
  targetDisputeId: string,
  verdictStatus: "RESOLVED" | "DISMISSED",
  explanation: string
): Promise<Result<null>> {
  const { error } = await db.rpc("process_dispute_settlement", {
    target_dispute_id: targetDisputeId,
    verdict_status: verdictStatus,
    explanation,
  });
  return error ? fail(error.message) : ok(null);
}

// ===========================================================================
//  CMS content
// ===========================================================================

export async function fetchCmsContent(db: DB): Promise<Result<CmsContent[]>> {
  const { data, error } = await db.from("cms_content").select("*").order("id", { ascending: true });
  return error ? fail(error.message) : ok(data ?? []);
}

export async function upsertCmsContent(
  db: DB,
  id: string,
  content: string,
  updatedBy: string | null
): Promise<Result<CmsContent>> {
  const { data, error } = await db
    .from("cms_content")
    .upsert({ id, content, updated_by: updatedBy, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

// ===========================================================================
//  Message moderation
// ===========================================================================

export async function fetchModerationFlags(
  db: DB
): Promise<Result<ModerationFlagWithParties[]>> {
  const { data, error } = await db
    .from("moderation_flags")
    .select(
      "*, sender:profiles!moderation_flags_sender_id_fkey(id, full_name, company_name, status), reporter:profiles!moderation_flags_reporter_id_fkey(id, full_name, company_name)"
    )
    .order("created_at", { ascending: false });
  return error ? fail(error.message) : ok((data as unknown as ModerationFlagWithParties[]) ?? []);
}

/** Mark a moderation flag resolved (dismiss). */
export async function resolveModerationFlag(db: DB, id: string): Promise<Result<null>> {
  const { error } = await db.from("moderation_flags").update({ is_resolved: true }).eq("id", id);
  return error ? fail(error.message) : ok(null);
}

/** Suspend an offending user by setting their profile status to REJECTED. */
export async function suspendUser(db: DB, profileId: string): Promise<Result<null>> {
  const { error } = await db.from("profiles").update({ status: "REJECTED" }).eq("id", profileId);
  return error ? fail(error.message) : ok(null);
}

// ===========================================================================
//  Platform settings (commission structure)
// ===========================================================================

export async function fetchPlatformSettings(db: DB): Promise<Result<PlatformSetting[]>> {
  const { data, error } = await db.from("platform_settings").select("*").order("key", { ascending: true });
  return error ? fail(error.message) : ok(data ?? []);
}

export async function updatePlatformSetting(
  db: DB,
  key: string,
  value: number
): Promise<Result<PlatformSetting>> {
  const { data, error } = await db
    .from("platform_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select()
    .single();
  return error ? fail(error.message) : ok(data);
}

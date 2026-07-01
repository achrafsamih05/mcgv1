/**
 * Hand-authored database types that mirror `supabase/schema.sql` exactly.
 *
 * These replace `any` everywhere the Supabase client is used. They are the
 * single TypeScript source of truth for the relational backend and are kept in
 * lock-step with the SQL enums and tables. No generated `Json`/`any` leakage.
 *
 * NOTE: The Row/Insert/Update shapes are declared as `type` aliases (not
 * `interface`) on purpose — Supabase's `GenericTable` constraint requires each
 * shape to satisfy `Record<string, unknown>`, which interfaces do not because
 * they are open to declaration merging.
 */

// --- Enums (mirror the PostgreSQL custom types) ---------------------------
export type PlatformRole =
  | "BUYER"
  | "SUPPLIER"
  | "DRIVER"
  | "WAREHOUSE_HOST"
  | "SUPER_ADMIN"
  | "ADMIN";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type DealStatus =
  | "OPEN"
  | "NEGOTIATION"
  | "CONTRACTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type VehicleType = "TRUCK" | "VAN" | "CAR" | "MOTORCYCLE";

export type RfqStatus = "OPEN" | "QUOTED" | "CLOSED";

export type QuotationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "MAINTENANCE";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

/** JSON value type for jsonb columns — strict, no `any`. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/** Ordered 8-stage supply-chain timeline for shipment tracking. */
export const SHIPMENT_STAGES = [
  "Task Created",
  "Accepted",
  "En Route to Pickup",
  "Cargo Loaded",
  "In Transit",
  "Customs / Hub",
  "Arrived at Destination",
  "Delivered",
] as const;

export type ShipmentStageLabel = (typeof SHIPMENT_STAGES)[number];

/** Commercial accounts require admin verification before public visibility. */
export const COMMERCIAL_ROLES: PlatformRole[] = [
  "SUPPLIER",
  "DRIVER",
  "WAREHOUSE_HOST",
];

/** Ordered deal stages, used to drive the Timeline_Stepper. */
export const DEAL_STAGES = [
  "OPEN",
  "NEGOTIATION",
  "CONTRACTED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

// --- Row shapes -----------------------------------------------------------
export type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  phone_number: string | null;
  role: PlatformRole;
  status: VerificationStatus;
  import_license_number: string | null;
  country_source: string | null;
  supplier_category: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  supplier_id: string;
  title: string;
  description: string | null;
  price_range: string | null;
  moq: number | null;
  lead_time: string | null;
  images: string[];
  created_at: string;
};

export type Warehouse = {
  id: string;
  host_id: string;
  title: string;
  city: string | null;
  total_area_m2: number | null;
  available_area_m2: number | null;
  price_per_m2_monthly: number | null;
  created_at: string;
};

export type DriverMetadata = {
  id: string;
  license_number: string | null;
  vehicle: VehicleType | null;
  max_weight_capacity_kg: number | null;
  created_at: string;
};

export type Rfq = {
  id: string;
  buyer_id: string;
  product_title: string;
  category: string | null;
  specifications: string | null;
  target_budget: string | null;
  quantity: number | null;
  status: RfqStatus;
  created_at: string;
};

export type Quotation = {
  id: string;
  rfq_id: string;
  supplier_id: string;
  offered_price: number | null;
  dynamic_lead_time: string | null;
  invoice_url: string | null;
  unit_price: number | null;
  shipping_lead_time: number | null;
  notes: string | null;
  status: QuotationStatus;
  created_at: string;
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  name: string;
  description: string | null;
  moq: number | null;
  price_range: string | null;
  image_url: string | null;
  created_at: string;
};

export type Vehicle = {
  id: string;
  carrier_id: string;
  plate_number: string | null;
  vehicle_type: string | null;
  max_weight_capacity: number | null;
  current_status: VehicleStatus;
  created_at: string;
};

export type Shipment = {
  id: string;
  deal_id: string | null;
  carrier_id: string | null;
  vehicle_id: string | null;
  origin: string | null;
  destination: string | null;
  current_stage: number;
  status_notes: string | null;
  updated_at: string;
};

export type Notification = {
  id: string;
  recipient_id: string | null;
  is_global: boolean;
  category: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export type Dispute = {
  id: string;
  creator_id: string | null;
  target_id: string | null;
  deal_id: string | null;
  subject: string;
  description: string | null;
  amount: number | null;
  status: DisputeStatus;
  admin_verdict: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  author_id: string | null;
  target_id: string | null;
  rating: number;
  comment: string | null;
  is_flagged: boolean;
  created_at: string;
};

export type SystemLog = {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  details: Json | null;
  created_at: string;
};

export type Wallet = {
  id: string;
  profile_id: string | null;
  current_balance: number;
  pending_escrow: number;
  created_at: string;
  updated_at: string;
};

export type CmsContent = {
  id: string;
  content: string;
  updated_by: string | null;
  updated_at: string;
};

export type ModerationFlag = {
  id: string;
  chat_message_id: string;
  sender_id: string | null;
  reporter_id: string | null;
  flag_reason: string;
  is_resolved: boolean;
  created_at: string;
};

export type PlatformSetting = {
  key: string;
  value: number;
  updated_at: string;
};

export type Deal = {
  id: string;
  buyer_id: string;
  supplier_id: string;
  quote_id: string;
  warehouse_id: string | null;
  driver_id: string | null;
  gross_valuation: number | null;
  status: DealStatus;
  created_at: string;
};

// --- Insert payload shapes (DB fills id/created_at/defaults) ---------------
export type ProfileInsert = Partial<Profile> & { id: string };
export type ProductInsert = Omit<Product, "id" | "created_at" | "images"> & {
  images?: string[];
};
export type WarehouseInsert = Omit<Warehouse, "id" | "created_at">;
export type RfqInsert = Omit<Rfq, "id" | "created_at" | "status" | "category"> & {
  status?: RfqStatus;
  category?: string | null;
};
export type QuotationInsert = Omit<
  Quotation,
  "id" | "created_at" | "status" | "offered_price" | "dynamic_lead_time" | "invoice_url" | "unit_price" | "shipping_lead_time" | "notes"
> & {
  status?: QuotationStatus;
  offered_price?: number | null;
  dynamic_lead_time?: string | null;
  invoice_url?: string | null;
  unit_price?: number | null;
  shipping_lead_time?: number | null;
  notes?: string | null;
};
export type SupplierProductInsert = Omit<SupplierProduct, "id" | "created_at">;
export type VehicleInsert = Omit<Vehicle, "id" | "created_at" | "current_status"> & {
  current_status?: VehicleStatus;
};
export type ShipmentInsert = Omit<Shipment, "id" | "updated_at" | "current_stage"> & {
  current_stage?: number;
};
export type NotificationInsert = Omit<Notification, "id" | "created_at" | "is_read"> & {
  is_read?: boolean;
};
export type DisputeInsert = Omit<Dispute, "id" | "created_at" | "updated_at" | "status" | "admin_verdict"> & {
  status?: DisputeStatus;
  admin_verdict?: string | null;
};
export type ReviewInsert = Omit<Review, "id" | "created_at" | "is_flagged"> & {
  is_flagged?: boolean;
};
export type SystemLogInsert = Omit<SystemLog, "id" | "created_at">;
export type CmsContentInsert = Omit<CmsContent, "updated_at"> & { updated_at?: string };
export type PlatformSettingInsert = Omit<PlatformSetting, "updated_at"> & { updated_at?: string };

// --- Joined read shapes ----------------------------------------------------
export type ProfileBrief = Pick<
  Profile,
  "id" | "full_name" | "company_name" | "status"
>;

export type ProductWithSupplier = Product & { profiles: ProfileBrief | null };
export type WarehouseWithHost = Warehouse & { profiles: ProfileBrief | null };
export type QuotationWithSupplier = Quotation & {
  profiles: Pick<Profile, "id" | "full_name" | "company_name"> | null;
};

/** Dispute joined to creator + target profile names for the admin center. */
export type DisputeWithParties = Dispute & {
  creator: Pick<Profile, "id" | "full_name" | "company_name"> | null;
  target: Pick<Profile, "id" | "full_name" | "company_name"> | null;
};

/** Review joined to its author + target profile names. */
export type ReviewWithParties = Review & {
  author: Pick<Profile, "id" | "full_name" | "company_name"> | null;
  target: Pick<Profile, "id" | "full_name" | "company_name"> | null;
};

/** Moderation flag joined to sender + reporter profile names. */
export type ModerationFlagWithParties = ModerationFlag & {
  sender: Pick<Profile, "id" | "full_name" | "company_name" | "status"> | null;
  reporter: Pick<Profile, "id" | "full_name" | "company_name"> | null;
};

/**
 * Minimal Database type map consumable by `SupabaseClient<Database>`. Only the
 * Row/Insert/Update shapes the app actually uses are declared. Each table
 * carries an empty `Relationships` tuple to satisfy the GenericTable contract.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<Profile>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: Partial<Product>;
        Relationships: [];
      };
      supplier_products: {
        Row: SupplierProduct;
        Insert: SupplierProductInsert;
        Update: Partial<SupplierProduct>;
        Relationships: [];
      };
      warehouses: {
        Row: Warehouse;
        Insert: WarehouseInsert;
        Update: Partial<Warehouse>;
        Relationships: [];
      };
      drivers_metadata: {
        Row: DriverMetadata;
        Insert: DriverMetadata;
        Update: Partial<DriverMetadata>;
        Relationships: [];
      };
      rfqs: {
        Row: Rfq;
        Insert: RfqInsert;
        Update: Partial<Rfq>;
        Relationships: [];
      };
      quotations: {
        Row: Quotation;
        Insert: QuotationInsert;
        Update: Partial<Quotation>;
        Relationships: [];
      };
      deals: {
        Row: Deal;
        Insert: Partial<Deal>;
        Update: Partial<Deal>;
        Relationships: [];
      };
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: Partial<Vehicle>;
        Relationships: [];
      };
      shipments: {
        Row: Shipment;
        Insert: ShipmentInsert;
        Update: Partial<Shipment>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<Notification>;
        Relationships: [];
      };
      disputes: {
        Row: Dispute;
        Insert: DisputeInsert;
        Update: Partial<Dispute>;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: Partial<Review>;
        Relationships: [];
      };
      system_logs: {
        Row: SystemLog;
        Insert: SystemLogInsert;
        Update: Partial<SystemLog>;
        Relationships: [];
      };
      wallets: {
        Row: Wallet;
        Insert: Partial<Wallet>;
        Update: Partial<Wallet>;
        Relationships: [];
      };
      cms_content: {
        Row: CmsContent;
        Insert: CmsContentInsert;
        Update: Partial<CmsContent>;
        Relationships: [];
      };
      moderation_flags: {
        Row: ModerationFlag;
        Insert: Partial<ModerationFlag>;
        Update: Partial<ModerationFlag>;
        Relationships: [];
      };
      platform_settings: {
        Row: PlatformSetting;
        Insert: PlatformSettingInsert;
        Update: Partial<PlatformSetting>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_deal: { Args: { p_quote_id: string }; Returns: Deal };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      process_dispute_settlement: {
        Args: { target_dispute_id: string; verdict_status: string; explanation: string };
        Returns: undefined;
      };
    };
    Enums: {
      platform_role: PlatformRole;
      verification_status: VerificationStatus;
      deal_status: DealStatus;
      vehicle_type: VehicleType;
      rfq_status: RfqStatus;
      quotation_status: QuotationStatus;
      vehicle_status: VehicleStatus;
      dispute_status: DisputeStatus;
    };
  };
};

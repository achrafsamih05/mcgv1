/**
 * ============================================================================
 *  MCG GLOBAL — SINGLE SOURCE OF TRUTH (State & Specs Repository)
 * ============================================================================
 *  Master layout configuration database for the entire multi-tenant trade &
 *  logistics platform. Contains strict TypeScript interfaces plus production-
 *  grade mock data for every dashboard, tailored to the China → Morocco
 *  import pipeline.
 *
 *  Coding rules honored:
 *   - No `any` anywhere. Every shape is explicitly typed.
 *   - All exports are `as const`-safe, compilable, and self-contained.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 * 🎨 DESIGN SYSTEM VARIABLES (Tailwind reference constants)
 * ------------------------------------------------------------------------- */

export const THEME = {
  /** Deep Dark Blue baseline — primary structural panels & backgrounds. */
  navy: "#0F172A",
  /** Accent Orange — CTAs, badges, steppers, currency tags, KPIs. */
  accent: "#F97316",
  /** Supporting neutrals used across the UI. */
  surface: "#F8FAFC",
  textPrimary: "#020617",
  textMuted: "#475569",
} as const;

export type ThemeTokens = typeof THEME;

/* ===========================================================================
 * 📊 SECTION 1 — CORE SHARED & RELATIONAL INTERFACES
 * ========================================================================= */

export type UserRole =
  | "BUYER"
  | "SUPPLIER"
  | "DRIVER"
  | "WAREHOUSE_HOST"
  | "SUPER_ADMIN";

export type Currency = "USD" | "EUR" | "MAD" | "CNY";

export type Language = "AR" | "EN" | "FR" | "ZH";

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string; // ISO 8601
  isVerified: boolean;
}

export type DocumentType =
  | "INVOICE"
  | "PACKING_LIST"
  | "BILL_OF_LADING"
  | "CONTRACT"
  | "IMAGE"
  | "PDF";

export type DocumentLinkedEntity = "ORDER" | "DEAL" | "SHIPMENT";

export interface DocumentAsset {
  id: string;
  type: DocumentType;
  fileUrl: string;
  linkedTo: DocumentLinkedEntity;
  entityId: string;
  uploadedAt: string; // ISO 8601
}

/* ---------------------------------------------------------------------------
 * 🔧 SHARED WORKFLOW & INTERACTIVE INTERFACES
 * ------------------------------------------------------------------------- */

export type DealStatus =
  | "OPEN"
  | "NEGOTIATION"
  | "CONTRACTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface DealPipeline {
  id: string;
  title: string;
  buyerId: string;
  supplierId: string;
  valuation: number;
  currency: Currency;
  status: DealStatus;
  documents: DocumentAsset[];
  timelineSteps: string[];
  createdAt: string;
}

export type DisputeStatus = "PENDING" | "UNDER_REVIEW" | "RESOLVED";

export interface DisputeCase {
  id: string;
  dealId: string;
  plaintiffId: string;
  defendantId: string;
  claimText: string;
  evidenceUrls: string[];
  adminVerdict: string;
  status: DisputeStatus;
}

export interface FederatedSearchItem {
  id: string;
  name: string;
  category: string;
  priceLabel: string;
  originCountry: string;
}

export interface FederatedSearchCorporation {
  id: string;
  name: string;
  role: UserRole;
  country: string;
  rating: number;
}

export interface FederatedSearchOperation {
  id: string;
  reference: string;
  stage: string;
  valuation: number;
  currency: Currency;
}

export interface FederatedSearchTerminal {
  id: string;
  name: string;
  city: string;
  kind: "WAREHOUSE" | "FLEET" | "PORT";
}

export interface FederatedSearchResults {
  query: string;
  items: FederatedSearchItem[];
  corporations: FederatedSearchCorporation[];
  operations: FederatedSearchOperation[];
  terminals: FederatedSearchTerminal[];
}

/* ===========================================================================
 * 💻 SECTION 2 — DASHBOARD INTERFACES & MOCK STATES
 * ========================================================================= */

/* ----------------------------- Shared enums ----------------------------- */

export type ProductCategory =
  | "Automotive"
  | "Machinery"
  | "Electronics"
  | "Furniture"
  | "Textiles"
  | "Construction"
  | "General";

export type VehicleType = "TRUCK" | "VAN" | "CAR" | "MOTORCYCLE";

export type TripStage = "LOADED" | "IN_TRANSIT" | "DELIVERED";

export type RFQStatus =
  | "NEW"
  | "IN_REVIEW"
  | "SUPPLIER_MATCHED"
  | "QUOTATIONS_RECEIVED"
  | "OFFER_ACCEPTED"
  | "CLOSED";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

/* ============================ 1. PUBLIC HOME ============================ */

export interface FeaturedSupplier {
  id: string;
  name: string;
  country: string;
  specialization: ProductCategory;
  rating: number;
  completedDeals: number;
  isVerified: boolean;
}

export interface WarehouseCluster {
  id: string;
  city: string;
  country: string;
  facilityCount: number;
  availableSqm: number;
  fromDailyPrice: number;
  currency: Currency;
}

export interface GlobalSystemStats {
  grossMerchandiseValueUsd: number;
  totalActiveLoads: number;
  registeredSuppliers: number;
  registeredBuyers: number;
  countriesServed: number;
}

export interface PublicHomePageState {
  searchString: string;
  selectedCategory: ProductCategory | "ALL";
  categoryMatrix: ProductCategory[];
  featuredSuppliers: FeaturedSupplier[];
  warehouseClusters: WarehouseCluster[];
  systemStats: GlobalSystemStats;
}

export const publicHomePageState: PublicHomePageState = {
  searchString: "",
  selectedCategory: "ALL",
  categoryMatrix: [
    "Automotive",
    "Machinery",
    "Electronics",
    "Furniture",
    "Textiles",
    "Construction",
    "General",
  ],
  featuredSuppliers: [
    { id: "SUP-001", name: "Guangzhou AutoParts Co.", country: "China", specialization: "Automotive", rating: 4.9, completedDeals: 412, isVerified: true },
    { id: "SUP-002", name: "Shenzhen TechWorks", country: "China", specialization: "Electronics", rating: 4.8, completedDeals: 365, isVerified: true },
    { id: "SUP-003", name: "Jinan Heavy Machinery", country: "China", specialization: "Machinery", rating: 4.9, completedDeals: 188, isVerified: true },
    { id: "SUP-004", name: "Foshan Home & Living", country: "China", specialization: "Furniture", rating: 4.6, completedDeals: 240, isVerified: false },
  ],
  warehouseClusters: [
    { id: "WC-CASA", city: "Casablanca", country: "Morocco", facilityCount: 18, availableSqm: 42000, fromDailyPrice: 0.12, currency: "USD" },
    { id: "WC-TNG", city: "Tangier", country: "Morocco", facilityCount: 11, availableSqm: 31000, fromDailyPrice: 0.1, currency: "USD" },
    { id: "WC-AGA", city: "Agadir", country: "Morocco", facilityCount: 6, availableSqm: 14500, fromDailyPrice: 0.13, currency: "USD" },
  ],
  systemStats: {
    grossMerchandiseValueUsd: 118_600_000,
    totalActiveLoads: 486,
    registeredSuppliers: 1_260,
    registeredBuyers: 5_140,
    countriesServed: 27,
  },
};

/* ========================= 2. BUYER / IMPORTER ========================= */

export interface BuyerRFQ {
  id: string;
  title: string;
  category: ProductCategory;
  quantity: number;
  targetBudget: number;
  currency: Currency;
  status: RFQStatus;
  createdAt: string;
}

export interface ManufacturerQuotation {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  currency: Currency;
  productionLeadDays: number;
  shippingDays: number;
  shippingMode: "MARINE" | "AIR";
  isSelectedForComparison: boolean;
}

export interface DeliveryTrackingNode {
  shipmentId: string;
  product: string;
  currentStage: string;
  progressPercent: number;
  etaDate: string;
}

export interface BuyerDashboardState {
  user: BaseUser;
  counts: {
    pendingRFQs: number;
    activeCargoLoads: number;
    openDisputes: number;
    savedSuppliers: number;
  };
  rfqHistory: BuyerRFQ[];
  incomingQuotations: ManufacturerQuotation[];
  trackingNodes: DeliveryTrackingNode[];
  preferredCurrency: Currency;
}

export const buyerDashboardState: BuyerDashboardState = {
  user: {
    id: "IMP-001",
    name: "Yassine El Amrani",
    email: "yassine@amrani-import.ma",
    phone: "+212 661 234 567",
    role: "BUYER",
    avatarUrl: "/avatars/imp-001.png",
    createdAt: "2026-01-12T08:30:00Z",
    isVerified: true,
  },
  counts: { pendingRFQs: 4, activeCargoLoads: 3, openDisputes: 1, savedSuppliers: 12 },
  rfqHistory: [
    { id: "RFQ-1001", title: "OEM Brake Pad Sets", category: "Automotive", quantity: 1200, targetBudget: 11_000, currency: "USD", status: "QUOTATIONS_RECEIVED", createdAt: "2026-06-02T09:00:00Z" },
    { id: "RFQ-1002", title: "Excavator CAT 320 Units", category: "Machinery", quantity: 3, targetBudget: 240_000, currency: "USD", status: "SUPPLIER_MATCHED", createdAt: "2026-06-04T10:15:00Z" },
    { id: "RFQ-1003", title: "LED Headlight Kits", category: "Electronics", quantity: 900, targetBudget: 13_500, currency: "USD", status: "IN_REVIEW", createdAt: "2026-06-06T14:40:00Z" },
    { id: "RFQ-1004", title: "Office Furniture Bulk", category: "Furniture", quantity: 500, targetBudget: 42_500, currency: "USD", status: "NEW", createdAt: "2026-06-08T11:05:00Z" },
  ],
  incomingQuotations: [
    { id: "Q-5001", rfqId: "RFQ-1001", supplierId: "SUP-001", supplierName: "Guangzhou AutoParts Co.", unitPrice: 8.5, currency: "USD", productionLeadDays: 25, shippingDays: 32, shippingMode: "MARINE", isSelectedForComparison: true },
    { id: "Q-5002", rfqId: "RFQ-1001", supplierId: "SUP-021", supplierName: "Foshan Parts Group", unitPrice: 7.9, currency: "USD", productionLeadDays: 30, shippingDays: 34, shippingMode: "MARINE", isSelectedForComparison: true },
    { id: "Q-5003", rfqId: "RFQ-1001", supplierId: "SUP-022", supplierName: "Ningbo Express Auto", unitPrice: 9.2, currency: "USD", productionLeadDays: 18, shippingDays: 7, shippingMode: "AIR", isSelectedForComparison: false },
  ],
  trackingNodes: [
    { shipmentId: "SHP-7001", product: "Cotton T-Shirts x10k", currentStage: "In Transit / Shipping", progressPercent: 75, etaDate: "2026-06-22" },
    { shipmentId: "SHP-7002", product: "Industrial Compressors x6", currentStage: "Manufacturing / Production", progressPercent: 50, etaDate: "2026-07-04" },
    { shipmentId: "SHP-7003", product: "LED TVs x200", currentStage: "Last-Mile Transport", progressPercent: 88, etaDate: "2026-06-12" },
  ],
  preferredCurrency: "MAD",
};

/* ====================== 3. SUPPLIER / MANUFACTURER ===================== */

export interface TieredPrice {
  minQuantity: number;
  unitPrice: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: ProductCategory;
  moq: number;
  leadTimeDays: number;
  tieredPricing: TieredPrice[];
  currency: Currency;
  isPublished: boolean;
}

export interface BillingInvoice {
  id: string;
  buyerName: string;
  amount: number;
  currency: Currency;
  issuedAt: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export interface IncomingSupplierRFQ {
  id: string;
  buyerName: string;
  product: string;
  quantity: number;
  targetBudget: number;
  currency: Currency;
  receivedAt: string;
}

export interface SupplierDashboardState {
  user: BaseUser;
  kyc: {
    status: KycStatus;
    submittedDocuments: DocumentType[];
    reviewerNote: string;
  };
  catalog: CatalogItem[];
  incomingRFQs: IncomingSupplierRFQ[];
  invoices: BillingInvoice[];
}

export const supplierDashboardState: SupplierDashboardState = {
  user: {
    id: "SUP-001",
    name: "Guangzhou AutoParts Co.",
    email: "sales@gzautoparts.cn",
    phone: "+86 20 1234 5678",
    role: "SUPPLIER",
    avatarUrl: "/avatars/sup-001.png",
    createdAt: "2025-11-03T02:10:00Z",
    isVerified: true,
  },
  kyc: {
    status: "APPROVED",
    submittedDocuments: ["CONTRACT", "PDF", "IMAGE"],
    reviewerNote: "ISO 9001 and export license verified by MCG compliance on 2026-01-15.",
  },
  catalog: [
    {
      id: "PR-1001", name: "Brake Pad Set (OEM)", category: "Automotive", moq: 500, leadTimeDays: 25, currency: "USD", isPublished: true,
      tieredPricing: [{ minQuantity: 500, unitPrice: 9.0 }, { minQuantity: 1000, unitPrice: 8.5 }, { minQuantity: 5000, unitPrice: 7.8 }],
    },
    {
      id: "PR-1002", name: "Alternator 12V 90A", category: "Automotive", moq: 200, leadTimeDays: 30, currency: "USD", isPublished: true,
      tieredPricing: [{ minQuantity: 200, unitPrice: 32 }, { minQuantity: 500, unitPrice: 28 }, { minQuantity: 1000, unitPrice: 24 }],
    },
    {
      id: "PR-1003", name: "LED Headlight Kit", category: "Electronics", moq: 300, leadTimeDays: 20, currency: "USD", isPublished: false,
      tieredPricing: [{ minQuantity: 300, unitPrice: 18 }, { minQuantity: 800, unitPrice: 15 }],
    },
  ],
  incomingRFQs: [
    { id: "RFQ-1001", buyerName: "Amrani Import Co.", product: "OEM Brake Pad Sets", quantity: 1200, targetBudget: 11_000, currency: "USD", receivedAt: "2026-06-08T09:14:00Z" },
    { id: "RFQ-2208", buyerName: "Atlas Motors", product: "Alternator 12V 90A", quantity: 400, targetBudget: 10_500, currency: "USD", receivedAt: "2026-06-08T11:42:00Z" },
  ],
  invoices: [
    { id: "INV-9001", buyerName: "Amrani Import Co.", amount: 40_000, currency: "USD", issuedAt: "2026-05-25T00:00:00Z", status: "PAID" },
    { id: "INV-9002", buyerName: "Sahara Trading", amount: 13_500, currency: "EUR", issuedAt: "2026-06-03T00:00:00Z", status: "PENDING" },
    { id: "INV-9003", buyerName: "Gulf Auto LLC", amount: 86_000, currency: "USD", issuedAt: "2026-05-12T00:00:00Z", status: "OVERDUE" },
  ],
};

/* ===================== 4. DRIVER & FLEET LOGISTICS ==================== */

export type CarrierKind = "INDIVIDUAL" | "LOGISTICS_FIRM";

export interface FleetAsset {
  id: string;
  vehicleType: VehicleType;
  plate: string;
  volumeCapacityM3: number;
  maxLoadKg: number;
  currentCity: string;
  isAvailable: boolean;
}

export interface AssignedTrip {
  id: string;
  clientName: string;
  origin: string;
  destination: string;
  goods: string;
  weightKg: number;
  stage: TripStage;
  payout: number;
  currency: Currency;
}

export interface WalletLog {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  at: string;
  direction: "CREDIT" | "DEBIT";
}

export interface DriverDashboardState {
  user: BaseUser;
  carrierKind: CarrierKind;
  fleet: FleetAsset[];
  activeTrips: AssignedTrip[];
  walletLogs: WalletLog[];
  netProfitUsd: number;
}

export const driverDashboardState: DriverDashboardState = {
  user: {
    id: "LP-001",
    name: "Atlas Freight Ltd.",
    email: "ops@atlasfreight.ma",
    phone: "+212 522 000 111",
    role: "DRIVER",
    avatarUrl: "/avatars/lp-001.png",
    createdAt: "2024-02-10T07:00:00Z",
    isVerified: true,
  },
  carrierKind: "LOGISTICS_FIRM",
  fleet: [
    { id: "VH-201", vehicleType: "TRUCK", plate: "12345-A-6", volumeCapacityM3: 86, maxLoadKg: 25_000, currentCity: "Casablanca", isAvailable: true },
    { id: "VH-202", vehicleType: "TRUCK", plate: "67890-B-2", volumeCapacityM3: 72, maxLoadKg: 18_000, currentCity: "Tangier", isAvailable: false },
    { id: "VH-203", vehicleType: "VAN", plate: "44556-C-1", volumeCapacityM3: 14, maxLoadKg: 1_500, currentCity: "Casablanca", isAvailable: true },
    { id: "VH-204", vehicleType: "MOTORCYCLE", plate: "78901-D-9", volumeCapacityM3: 0.2, maxLoadKg: 20, currentCity: "Rabat", isAvailable: true },
  ],
  activeTrips: [
    { id: "TRIP-7001", clientName: "Atlas Motors", origin: "Casablanca Port", destination: "Fès Distribution Center", goods: "Alternators & brake kits", weightKg: 9_400, stage: "IN_TRANSIT", payout: 1_850, currency: "USD" },
    { id: "TRIP-7002", clientName: "Sahara Trading", origin: "Tangier Med", destination: "Oujda Depot", goods: "Consumer electronics", weightKg: 6_500, stage: "LOADED", payout: 1_320, currency: "USD" },
  ],
  walletLogs: [
    { id: "WL-1", description: "Payout — TRIP-6990 (Casablanca → Marrakech)", amount: 1_640, currency: "USD", at: "2026-06-05T16:00:00Z", direction: "CREDIT" },
    { id: "WL-2", description: "Platform commission (8%)", amount: 131, currency: "USD", at: "2026-06-05T16:00:00Z", direction: "DEBIT" },
    { id: "WL-3", description: "Payout — TRIP-6985 (Port → Agadir)", amount: 2_100, currency: "USD", at: "2026-06-03T12:30:00Z", direction: "CREDIT" },
  ],
  netProfitUsd: 742_300,
};

/* ======================= 5. WAREHOUSE HOST ============================ */

export type FacilityAvailability = "AVAILABLE" | "FULL" | "TEMPORARILY_CLOSED";

export interface WarehouseAssetRecord {
  id: string;
  name: string;
  city: string;
  category: string;
  totalSqm: number;
  availableSqm: number;
  availability: FacilityAvailability;
}

export interface ReservationEntry {
  id: string;
  clientName: string;
  facilityId: string;
  startDate: string;
  endDate: string;
  reservedSqm: number;
}

export interface TemporalPricingRule {
  facilityId: string;
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
  currency: Currency;
}

export interface WarehouseHostDashboardState {
  user: BaseUser;
  assets: WarehouseAssetRecord[];
  reservations: ReservationEntry[];
  pricingRules: TemporalPricingRule[];
  activeClientCount: number;
}

export const warehouseHostDashboardState: WarehouseHostDashboardState = {
  user: {
    id: "WO-001",
    name: "Casablanca Storage Hub",
    email: "ops@casastorage.ma",
    phone: "+212 522 444 555",
    role: "WAREHOUSE_HOST",
    avatarUrl: "/avatars/wo-001.png",
    createdAt: "2024-03-01T09:00:00Z",
    isVerified: true,
  },
  assets: [
    { id: "WH-201", name: "Ain Sebaa Bonded Warehouse", city: "Casablanca", category: "Bonded/Cargo", totalSqm: 12_000, availableSqm: 4_200, availability: "AVAILABLE" },
    { id: "WH-202", name: "Port Cold Storage Facility", city: "Casablanca", category: "Cold Storage", totalSqm: 5_000, availableSqm: 0, availability: "FULL" },
    { id: "WH-203", name: "Bouskoura General Depot", city: "Bouskoura", category: "General", totalSqm: 8_000, availableSqm: 6_500, availability: "TEMPORARILY_CLOSED" },
  ],
  reservations: [
    { id: "RES-3001", clientName: "Amrani Import Co.", facilityId: "WH-201", startDate: "2026-06-20", endDate: "2026-09-18", reservedSqm: 600 },
    { id: "RES-3002", clientName: "Sahara Trading", facilityId: "WH-203", startDate: "2026-06-15", endDate: "2026-07-15", reservedSqm: 1_200 },
    { id: "RES-3003", clientName: "Gulf Auto LLC", facilityId: "WH-201", startDate: "2026-07-01", endDate: "2026-12-28", reservedSqm: 900 },
  ],
  pricingRules: [
    { facilityId: "WH-201", daily: 0.15, weekly: 0.9, monthly: 4.5, annual: 48, currency: "USD" },
    { facilityId: "WH-202", daily: 0.35, weekly: 2.1, monthly: 9.5, annual: 102, currency: "USD" },
    { facilityId: "WH-203", daily: 0.12, weekly: 0.7, monthly: 3.8, annual: 40, currency: "USD" },
  ],
  activeClientCount: 14,
};

/* ================== 6. SUPER ADMIN / CEO STRATEGIC BI ================= */

export interface MoMGrowthPoint {
  month: string;
  revenueUsd: number;
  profitUsd: number;
}

export interface PlatformMarginSlice {
  source: string;
  amountUsd: number;
}

export interface SuperAdminDashboardState {
  macro: {
    globalRegisteredUsers: number;
    aggregatePlatformVolumeUsd: number;
    realTimeProfitMarginPercent: number;
    activeShipments: number;
  };
  marginDistribution: PlatformMarginSlice[];
  fraudQueue: DisputeCase[];
  highPriorityDisputes: DisputeCase[];
  momGrowth: MoMGrowthPoint[];
}

export const superAdminDashboardState: SuperAdminDashboardState = {
  macro: {
    globalRegisteredUsers: 8_412,
    aggregatePlatformVolumeUsd: 118_600_000,
    realTimeProfitMarginPercent: 18.4,
    activeShipments: 486,
  },
  marginDistribution: [
    { source: "Sourcing commissions", amountUsd: 1_840_000 },
    { source: "Logistics fleet payouts fee", amountUsd: 620_000 },
    { source: "Warehouse booking fees", amountUsd: 310_000 },
    { source: "Escrow service charges", amountUsd: 240_000 },
  ],
  fraudQueue: [
    { id: "DSP-FR-01", dealId: "DEAL-3300", plaintiffId: "IMP-014", defendantId: "SUP-090", claimText: "Supplier profile appears fraudulent — no verifiable export license.", evidenceUrls: ["/evidence/fr01-a.pdf"], adminVerdict: "", status: "PENDING" },
    { id: "DSP-FR-02", dealId: "DEAL-3312", plaintiffId: "IMP-021", defendantId: "LP-044", claimText: "Bot-generated 5-star reviews detected on logistics provider.", evidenceUrls: ["/evidence/fr02-a.png", "/evidence/fr02-b.png"], adminVerdict: "", status: "UNDER_REVIEW" },
  ],
  highPriorityDisputes: [
    { id: "DSP-88", dealId: "DEAL-3001", plaintiffId: "IMP-009", defendantId: "SUP-031", claimText: "40 of 500 chairs arrived with broken frames; requesting partial refund of $3,400.", evidenceUrls: ["/evidence/88-a.jpg", "/evidence/88-b.jpg", "/evidence/88-report.pdf"], adminVerdict: "", status: "UNDER_REVIEW" },
    { id: "DSP-90", dealId: "DEAL-3120", plaintiffId: "IMP-001", defendantId: "WO-014", claimText: "Billed for 120 days but goods stored 90 days; disputing $1,800 overcharge.", evidenceUrls: ["/evidence/90-invoice.pdf"], adminVerdict: "", status: "PENDING" },
  ],
  momGrowth: [
    { month: "2026-01", revenueUsd: 1_800_000, profitUsd: 540_000 },
    { month: "2026-02", revenueUsd: 2_100_000, profitUsd: 620_000 },
    { month: "2026-03", revenueUsd: 1_950_000, profitUsd: 580_000 },
    { month: "2026-04", revenueUsd: 2_300_000, profitUsd: 710_000 },
    { month: "2026-05", revenueUsd: 2_410_000, profitUsd: 760_000 },
    { month: "2026-06", revenueUsd: 2_620_000, profitUsd: 820_000 },
  ],
};

/* ===========================================================================
 * 🔗 SHARED WORKFLOW MOCK STATE
 * ========================================================================= */

export const dealPipelines: DealPipeline[] = [
  {
    id: "DEAL-3001",
    title: "Cotton T-Shirts Bulk Import",
    buyerId: "IMP-001",
    supplierId: "SUP-010",
    valuation: 40_000,
    currency: "USD",
    status: "COMPLETED",
    documents: [
      { id: "DOC-4", type: "CONTRACT", fileUrl: "/docs/supply_contract_3001.docx", linkedTo: "DEAL", entityId: "DEAL-3001", uploadedAt: "2026-05-25T10:00:00Z" },
    ],
    timelineSteps: ["Sourcing Request", "Supplier Selection", "Negotiation", "Production", "Shipping", "Warehousing", "Last-Mile", "Delivered"],
    createdAt: "2026-05-25T10:00:00Z",
  },
  {
    id: "DEAL-3002",
    title: "Industrial Compressors Procurement",
    buyerId: "IMP-001",
    supplierId: "SUP-011",
    valuation: 86_000,
    currency: "USD",
    status: "IN_PROGRESS",
    documents: [],
    timelineSteps: ["Sourcing Request", "Supplier Selection", "Negotiation", "Production"],
    createdAt: "2026-05-30T15:00:00Z",
  },
  {
    id: "DEAL-3004",
    title: "Excavator Fleet (CAT 320)",
    buyerId: "IMP-003",
    supplierId: "SUP-012",
    valuation: 240_000,
    currency: "USD",
    status: "NEGOTIATION",
    documents: [],
    timelineSteps: ["Sourcing Request", "Supplier Selection", "Negotiation"],
    createdAt: "2026-06-05T08:30:00Z",
  },
];

export const disputeCases: DisputeCase[] = [
  ...superAdminDashboardState.highPriorityDisputes,
  {
    id: "DSP-89",
    dealId: "DEAL-3090",
    plaintiffId: "IMP-007",
    defendantId: "LP-019",
    claimText: "Electronics carton crushed on delivery; driver stacked heavy cargo on top.",
    evidenceUrls: ["/evidence/89-crushed.jpg"],
    adminVerdict: "",
    status: "PENDING",
  },
];

export const federatedSearchSample: FederatedSearchResults = {
  query: "Toyota",
  items: [
    { id: "PR-T1", name: "Toyota Hilux Brake Kit", category: "Automotive", priceLabel: "$8–14", originCountry: "China" },
    { id: "PR-T2", name: "Toyota Corolla Alternator", category: "Automotive", priceLabel: "$22–35", originCountry: "China" },
  ],
  corporations: [
    { id: "SUP-001", name: "Guangzhou AutoParts Co.", role: "SUPPLIER", country: "China", rating: 4.9 },
    { id: "SUP-051", name: "Toyota Parts Trading Ltd.", role: "SUPPLIER", country: "Japan", rating: 4.7 },
  ],
  operations: [
    { id: "DEAL-3001", reference: "Toyota-compatible brake pads order", stage: "COMPLETED", valuation: 40_000, currency: "USD" },
  ],
  terminals: [
    { id: "WH-201", name: "Ain Sebaa Bonded Warehouse", city: "Casablanca", kind: "WAREHOUSE" },
    { id: "LP-001", name: "Atlas Freight Ltd.", city: "Casablanca", kind: "FLEET" },
    { id: "PORT-CASA", name: "Casablanca Port Terminal", city: "Casablanca", kind: "PORT" },
  ],
};

/* ===========================================================================
 * 🗂️  MASTER PLATFORM STATE — single aggregated export
 * ========================================================================= */

export interface MasterPlatformState {
  theme: ThemeTokens;
  supportedCurrencies: Currency[];
  supportedLanguages: Language[];
  publicHome: PublicHomePageState;
  buyer: BuyerDashboardState;
  supplier: SupplierDashboardState;
  driver: DriverDashboardState;
  warehouseHost: WarehouseHostDashboardState;
  superAdmin: SuperAdminDashboardState;
  deals: DealPipeline[];
  disputes: DisputeCase[];
  federatedSearch: FederatedSearchResults;
}

export const masterPlatformState: MasterPlatformState = {
  theme: THEME,
  supportedCurrencies: ["USD", "EUR", "MAD", "CNY"],
  supportedLanguages: ["AR", "EN", "FR", "ZH"],
  publicHome: publicHomePageState,
  buyer: buyerDashboardState,
  supplier: supplierDashboardState,
  driver: driverDashboardState,
  warehouseHost: warehouseHostDashboardState,
  superAdmin: superAdminDashboardState,
  deals: dealPipelines,
  disputes: disputeCases,
  federatedSearch: federatedSearchSample,
};

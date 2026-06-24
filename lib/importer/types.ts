/**
 * Core data models for the MCG Global Buyers & Importers System.
 * All records are user-bound via `importerId`; isolation enforced in
 * lib/importer/rbac.ts.
 */

export type ImportVolumeTier =
  | "< $50K / year"
  | "$50K – $250K / year"
  | "$250K – $1M / year"
  | "> $1M / year";

export const IMPORT_VOLUME_TIERS: ImportVolumeTier[] = [
  "< $50K / year",
  "$50K – $250K / year",
  "$250K – $1M / year",
  "> $1M / year",
];

export type ProductCategory =
  | "Cars & Vehicles"
  | "Heavy Equipment"
  | "Industrial Machines"
  | "Electronics"
  | "Furniture"
  | "Clothing & Fashion"
  | "General Products";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Cars & Vehicles",
  "Heavy Equipment",
  "Industrial Machines",
  "Electronics",
  "Furniture",
  "Clothing & Fashion",
  "General Products",
];

export const INDUSTRY_VERTICALS = [
  "Automotive",
  "Construction",
  "Manufacturing",
  "Consumer Electronics",
  "Retail & Fashion",
  "Home & Furniture",
  "Wholesale Distribution",
] as const;

export type IndustryVertical = (typeof INDUSTRY_VERTICALS)[number];

export interface ImporterUser {
  id: string;
  fullName: string;
  companyName?: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  industry: IndustryVertical;
  interestCategories: ProductCategory[];
  volumeTier: ImportVolumeTier;
}

export type RFQStatus =
  | "New"
  | "In Review"
  | "Supplier Matched"
  | "Quotations Received"
  | "Offer Accepted"
  | "Closed";

export interface SourcingRFQ {
  id: string;
  importerId: string;
  title: string;
  category: ProductCategory;
  quantity: number;
  targetBudget: number;
  specifications: string;
  deliveryTimeline: string;
  attachments: number;
  status: RFQStatus;
  createdAt: string;
  quotationCount: number;
}

export interface SupplierQuotation {
  id: string;
  rfqId: string;
  importerId: string;
  supplierName: string;
  supplierCountry: string;
  unitPrice: number;
  quantity: number;
  productionDays: number;
  shippingDays: number;
  shippingMode: "Marine" | "Air";
  remarks: string;
  status: "Pending" | "Accepted" | "Declined" | "Modification Requested";
}

export interface DealContract {
  id: string;
  importerId: string;
  rfqTitle: string;
  supplierName: string;
  supplierCountry: string;
  valuation: number;
  executedAt: string;
}

export type TrackingMilestone =
  | "Request Received"
  | "Supplier Found"
  | "Negotiation"
  | "In Production"
  | "Cargo Ready"
  | "In Transit/Shipping"
  | "Arrived at Hub"
  | "Delivered & Signed";

export const TRACKING_MILESTONES: TrackingMilestone[] = [
  "Request Received",
  "Supplier Found",
  "Negotiation",
  "In Production",
  "Cargo Ready",
  "In Transit/Shipping",
  "Arrived at Hub",
  "Delivered & Signed",
];

export interface TrackingEvent {
  id: string;
  milestone: TrackingMilestone;
  note: string;
  at: string;
}

export interface TrackingTimelineState {
  id: string;
  importerId: string;
  shipmentRef: string;
  product: string;
  supplierName: string;
  currentMilestone: TrackingMilestone;
  events: TrackingEvent[];
}

export type LogisticsBookingKind = "Warehouse" | "Transport";

export interface LogisticsBooking {
  id: string;
  importerId: string;
  kind: LogisticsBookingKind;
  providerName: string;
  detail: string;
  status: "Inquiry" | "Booked" | "Completed";
  createdAt: string;
}

export interface ImporterAnalytics {
  activeRFQs: number;
  ongoingDeals: number;
  liveShipments: number;
  savedSuppliers: number;
  unreadAlerts: number;
}

/* --- Marketplace browse models (public listings, read-only) --- */

export interface MarketProduct {
  id: string;
  name: string;
  category: ProductCategory;
  supplierName: string;
  originCountry: string;
  priceMin: number;
  priceMax: number;
  moq: number;
}

export interface MarketSupplier {
  id: string;
  name: string;
  country: string;
  verified: boolean;
  rating: number;
  years: number;
  specialization: string;
}

export interface MarketWarehouse {
  id: string;
  name: string;
  country: string;
  city: string;
  availableSqm: number;
  dailyPrice: number;
}

export interface MarketFleet {
  id: string;
  name: string;
  city: string;
  vehicleType: "Truck" | "Van" | "Car" | "Motorcycle";
  rating: number;
  available: boolean;
}

export type ImporterSectionId =
  | "home"
  | "sourcing"
  | "rfqs"
  | "quotations"
  | "tracking"
  | "logistics"
  | "feedback"
  | "profile";

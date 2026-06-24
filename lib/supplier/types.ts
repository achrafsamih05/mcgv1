/**
 * Core data models for the MCG Global Suppliers System.
 * All models are tenant-scoped via `supplierId` to enforce multi-tenant
 * isolation — see lib/supplier/rbac.ts for the access guardrails.
 */

export type BusinessType = "Manufacturer" | "Trading Company";

export type VerificationState = "Pending" | "Approved" | "Rejected";

export type ProductCategory =
  | "Cars & Vehicles"
  | "Heavy Equipment"
  | "Industrial Machines"
  | "Electronics"
  | "Furniture"
  | "Clothing & Fashion"
  | "Others";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Cars & Vehicles",
  "Heavy Equipment",
  "Industrial Machines",
  "Electronics",
  "Furniture",
  "Clothing & Fashion",
  "Others",
];

export const EXPORT_MARKETS = [
  "North America",
  "South America",
  "Western Europe",
  "Eastern Europe",
  "Middle East",
  "North Africa",
  "Sub-Saharan Africa",
  "Southeast Asia",
  "Oceania",
] as const;

export type ExportMarket = (typeof EXPORT_MARKETS)[number];

export interface Credential {
  id: string;
  name: string;
  type: "Trade Certificate" | "Export License";
  fileName: string;
  issuedAt: string;
}

export interface SupplierProfile {
  id: string;
  // Company identity
  companyName: string;
  logoUrl?: string;
  coverUrl?: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  businessEmail: string;
  website?: string;
  description: string;
  // Business operations profile
  businessType: BusinessType;
  yearEstablished: number;
  totalEmployees: number;
  targetMarkets: ExportMarket[];
  // Trust
  verification: VerificationState;
  rating: number;
  reviewCount: number;
  credentials: Credential[];
  whatsapp: string;
}

export interface B2BProduct {
  id: string;
  supplierId: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: number; // count of gallery images (placeholder)
  videoUrl?: string;
  priceMin: number;
  priceMax: number;
  moq: number;
  leadTimeDays: number;
  status: "Live" | "Draft" | "Hidden";
  createdAt: string;
}

export type RequestStatus =
  | "New"
  | "Accepted"
  | "Rejected"
  | "Quoted";

export interface IncomingRequest {
  id: string;
  supplierId: string;
  buyerName: string;
  buyerCountry: string;
  productName: string;
  quantity: number;
  targetBudget: number;
  notes: string;
  status: RequestStatus;
  receivedAt: string;
}

export interface Quotation {
  id: string;
  requestId: string;
  supplierId: string;
  unitPrice: number;
  productionDays: number;
  shippingDays: number;
  terms: string;
  createdAt: string;
}

export interface SupplierAnalytics {
  liveProducts: number;
  activeOrders: number;
  unreadMessages: number;
  pageViews: number;
  uniqueBuyers: number;
}

export interface Review {
  id: string;
  supplierId: string;
  buyerName: string;
  rating: number; // 1..5
  comment: string;
  orderRef: string;
  createdAt: string;
}

export type ChatAttachment = {
  id: string;
  name: string;
  kind: "pdf" | "image" | "doc";
};

export interface ChatMessage {
  id: string;
  threadId: string;
  from: "supplier" | "buyer";
  text: string;
  attachments?: ChatAttachment[];
  quotationRef?: string;
  at: string;
}

export interface ChatThread {
  id: string;
  supplierId: string;
  buyerName: string;
  buyerCountry: string;
  lastPreview: string;
  unread: number;
  messages: ChatMessage[];
}

export type SupplierSectionId =
  | "home"
  | "catalog"
  | "rfq"
  | "messages"
  | "reviews"
  | "profile";

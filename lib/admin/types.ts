/**
 * Strictly-typed domain model for the MCG Global Super Admin dashboard.
 * These interfaces back the dashboard state and mock data layer.
 */

export type AccountType =
  | "Buyer"
  | "Supplier"
  | "Driver"
  | "Transport Company"
  | "Warehouse";

export type AccountStatus =
  | "Active"
  | "Pending"
  | "Suspended"
  | "Banned"
  | "Deactivated";

export type VerificationStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  accountType: AccountType;
  registeredAt: string; // ISO date
  status: AccountStatus;
  verified: boolean;
}

export interface KycDocument {
  id: string;
  label: string;
  type: "Company Registration" | "Trade Certificate" | "Tax File" | "Verification";
  fileName: string;
  uploadedAt: string;
}

export interface Supplier {
  id: string;
  company: string;
  country: string;
  specialization: string;
  submittedAt: string;
  status: VerificationStatus;
  verified: boolean;
  documents: KycDocument[];
}

export interface Driver {
  id: string;
  name: string;
  kind: "Driver" | "Transport Company";
  country: string;
  vehicle: string;
  licenseValid: boolean;
  permitValid: boolean;
  ownershipVerified: boolean;
  status: AccountStatus;
  verified: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  coordinates: string;
  capacitySqm: number;
  dailyPrice: number;
  monthlyPrice: number;
  status: VerificationStatus;
  verified: boolean;
  photos: number;
  safetyDocs: number;
}

export type ProductStatus = "Live" | "Hidden" | "Flagged";

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  status: ProductStatus;
  listedAt: string;
}

export type OrderStage =
  | "Request Received"
  | "Supplier Found"
  | "Negotiation"
  | "Production"
  | "Shipping"
  | "Arrived"
  | "Delivered";

export interface LogisticsOrder {
  id: string;
  product: string;
  buyer: string;
  supplier: string;
  origin: string;
  destination: string;
  stage: OrderStage;
  value: number;
  updatedAt: string;
}

export interface TrackingLog {
  id: string;
  message: string;
  timestamp: string;
  author: string;
}

export type DealStatus =
  | "Negotiating"
  | "Escrow Held"
  | "Released"
  | "Cancelled"
  | "Mediation";

export interface Deal {
  id: string;
  buyer: string;
  supplier: string;
  amount: number;
  status: DealStatus;
  createdAt: string;
}

export type DisputeAxis =
  | "Buyer vs Supplier"
  | "Buyer vs Driver"
  | "Buyer vs Warehouse";

export interface Dispute {
  id: string;
  axis: DisputeAxis;
  claimant: string;
  respondent: string;
  subject: string;
  amount: number;
  status: "Open" | "Under Review" | "Resolved";
  openedAt: string;
  evidence: number;
}

export interface FlaggedMessage {
  id: string;
  from: string;
  to: string;
  excerpt: string;
  reason: string;
  reportedAt: string;
}

export interface Review {
  id: string;
  author: string;
  target: string;
  rating: number;
  comment: string;
  status: "Published" | "Flagged" | "Removed";
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  operatorId: string;
  operator: string;
  resource: string;
  action: string;
  before: string;
  after: string;
  timestamp: string;
}

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  delta?: number; // percent change
  intent?: "default" | "accent" | "danger" | "success";
  hint?: string;
}

export type AdminSectionId =
  | "dashboard"
  | "users"
  | "suppliers"
  | "drivers"
  | "warehouses"
  | "products"
  | "orders"
  | "deals"
  | "tracking"
  | "disputes"
  | "moderation"
  | "broadcast"
  | "finance"
  | "cms"
  | "reviews"
  | "audit"
  | "settings";

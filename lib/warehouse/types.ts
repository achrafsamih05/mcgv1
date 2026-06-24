/**
 * Core data models for the MCG Global Warehouses System.
 * Tenant-scoped records carry `operatorId`; isolation enforced in
 * lib/warehouse/rbac.ts.
 */

export type OperatorKind = "Individual Owner" | "Storage Company";

export type VerificationState = "Pending" | "Approved" | "Rejected";

export type FacilityAvailability =
  | "Available for Booking"
  | "Full/Max Capacity"
  | "Temporarily Closed";

export type WarehouseCategory =
  | "General"
  | "Bonded/Cargo"
  | "Cold Storage"
  | "Frozen Storage"
  | "Vehicle Storage"
  | "Heavy Equipment Storage"
  | "Container Yard"
  | "Electronics Specialized";

export const WAREHOUSE_CATEGORIES: WarehouseCategory[] = [
  "General",
  "Bonded/Cargo",
  "Cold Storage",
  "Frozen Storage",
  "Vehicle Storage",
  "Heavy Equipment Storage",
  "Container Yard",
  "Electronics Specialized",
];

export type AncillaryServiceKey =
  | "loading"
  | "security"
  | "cctv"
  | "insurance"
  | "packaging";

export interface AncillaryService {
  key: AncillaryServiceKey;
  label: string;
  enabled: boolean;
  price: number; // custom price for the add-on
}

export const DEFAULT_ANCILLARY_SERVICES: AncillaryService[] = [
  { key: "loading", label: "Loading / Unloading", enabled: false, price: 0 },
  { key: "security", label: "24/7 Security Guards", enabled: false, price: 0 },
  { key: "cctv", label: "CCTV Monitoring", enabled: false, price: 0 },
  { key: "insurance", label: "Cargo Insurance", enabled: false, price: 0 },
  { key: "packaging", label: "Packaging / Palletizing", enabled: false, price: 0 },
];

export interface PricingModel {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

export interface ComplianceDoc {
  id: string;
  label: string;
  type:
    | "National ID"
    | "Commercial Registry"
    | "Business Activity License"
    | "Property/Lease Proof";
  fileName: string;
  uploadedAt: string;
}

export interface WarehouseOperator {
  id: string;
  kind: OperatorKind;
  fullName: string;
  companyName?: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  description: string;
  verification: VerificationState;
  rating: number;
  documents: ComplianceDoc[];
  whatsapp: string;
}

export interface WarehouseFacility {
  id: string;
  operatorId: string;
  name: string;
  category: WarehouseCategory;
  country: string;
  city: string;
  address: string;
  coordinates: string;
  imageCount: number;
  videoUrl?: string;
  // Structural specs
  totalAreaSqm: number;
  availableSqm: number;
  floors: number;
  clearanceHeightM: number;
  floorType: string;
  // Commercial
  pricing: PricingModel;
  services: AncillaryService[];
  availability: FacilityAvailability;
  verification: VerificationState;
}

export type BookingStatus = "New" | "Accepted" | "Rejected" | "Quoted";

export interface SpaceBookingRequest {
  id: string;
  operatorId: string;
  facilityId: string;
  facilityName: string;
  clientName: string;
  clientCountry: string;
  cargoDescription: string;
  spaceSqm: number;
  durationDays: number;
  startDate: string;
  status: BookingStatus;
  receivedAt: string;
}

export interface BookingQuotation {
  id: string;
  bookingId: string;
  operatorId: string;
  price: number;
  includedServices: AncillaryServiceKey[];
  confirmedDays: number;
  notes: string;
  createdAt: string;
}

export interface WarehouseEarnings {
  today: number;
  weekly: number;
  monthly: number;
  lifetime: number;
}

export interface WarehouseAnalytics {
  totalWarehouses: number;
  lifetimeBookings: number;
  activeContracts: number;
  completedBookings: number;
  grossRevenue: number;
}

export type ChatAttachment = {
  id: string;
  name: string;
  kind: "pdf" | "image" | "doc";
};

export interface ChatMessage {
  id: string;
  threadId: string;
  from: "operator" | "client";
  text: string;
  attachments?: ChatAttachment[];
  at: string;
}

export interface ChatThread {
  id: string;
  operatorId: string;
  clientName: string;
  clientCountry: string;
  lastPreview: string;
  unread: number;
  messages: ChatMessage[];
}

export type WarehouseSectionId =
  | "home"
  | "facilities"
  | "bookings"
  | "earnings"
  | "messages"
  | "profile";

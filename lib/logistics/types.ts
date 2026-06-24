/**
 * Core data models for the MCG Global Drivers & Transportation System.
 * All tenant-scoped records carry `providerId`; isolation is enforced in
 * lib/logistics/rbac.ts.
 */

export type ProviderKind = "Independent Driver" | "Transport Company";

export type VerificationState = "Pending" | "Approved" | "Rejected";

export type Availability = "Available Now" | "Busy" | "Out of Service";

export type VehicleClass = "Truck" | "Van" | "Car" | "Motorcycle";

export const VEHICLE_CLASSES: VehicleClass[] = ["Truck", "Van", "Car", "Motorcycle"];

export interface ComplianceDoc {
  id: string;
  label: string;
  type:
    | "Driving License"
    | "National ID"
    | "Commercial Registry"
    | "Transport License";
  fileName: string;
  uploadedAt: string;
}

export interface LogisticsProvider {
  id: string;
  kind: ProviderKind;
  displayName: string; // driver full name or company name
  logoUrl?: string;
  coverUrl?: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  description: string;
  availability: Availability;
  verification: VerificationState;
  rating: number;
  clientsServed: number;
  completedTrips: number;
  documents: ComplianceDoc[];
  whatsapp: string;
}

export interface VehicleAsset {
  id: string;
  providerId: string;
  class: VehicleClass;
  truckType?: string; // e.g. Flatbed, Box, Refrigerated
  plate: string;
  maxPayloadKg: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
  manufactureYear?: number;
  currentCity: string;
  available: boolean;
  imageCount: number;
}

export type FreightStatus =
  | "New"
  | "Accepted"
  | "Rejected"
  | "Quoted";

export interface FreightOrder {
  id: string;
  providerId: string;
  clientName: string;
  clientCountry: string;
  origin: string;
  destination: string;
  cargoType: string;
  weightKg: number;
  volumeM3: number;
  schedule: string;
  notes: string;
  status: FreightStatus;
  receivedAt: string;
}

export interface LogisticsQuotation {
  id: string;
  orderId: string;
  providerId: string;
  price: number;
  deliveryDays: number;
  notes: string;
  createdAt: string;
}

export type TripStage =
  | "New Task Created"
  | "Accepted"
  | "En Route to Pickup"
  | "Cargo Loaded/Received"
  | "In Transit"
  | "Arrived at Destination"
  | "Delivered Successfully";

export const TRIP_STAGES: TripStage[] = [
  "New Task Created",
  "Accepted",
  "En Route to Pickup",
  "Cargo Loaded/Received",
  "In Transit",
  "Arrived at Destination",
  "Delivered Successfully",
];

export interface TripStatusUpdate {
  id: string;
  tripId: string;
  message: string;
  stage: TripStage;
  at: string;
}

export interface ActiveTrip {
  id: string;
  providerId: string;
  clientName: string;
  orderDate: string;
  goods: string;
  weightKg: number;
  origin: string;
  destination: string;
  stage: TripStage;
  updates: TripStatusUpdate[];
}

export interface LogisticsEarnings {
  today: number;
  weekly: number;
  monthly: number;
  lifetime: number;
}

export interface ProviderAnalytics {
  assignedTasks: number;
  pendingRequests: number;
  completedDeliveries: number;
  rating: number;
  earnings: number;
}

export type ChatAttachment = {
  id: string;
  name: string;
  kind: "pdf" | "image" | "doc";
};

export interface ChatMessage {
  id: string;
  threadId: string;
  from: "provider" | "client" | "support";
  text: string;
  attachments?: ChatAttachment[];
  at: string;
}

export interface ChatThread {
  id: string;
  providerId: string;
  party: string;
  kind: "Client" | "Platform Support";
  lastPreview: string;
  unread: number;
  messages: ChatMessage[];
}

export type LogisticsSectionId =
  | "home"
  | "fleet"
  | "jobs"
  | "trips"
  | "earnings"
  | "messages"
  | "profile";

import type {
  ActiveTrip,
  ChatThread,
  FreightOrder,
  LogisticsEarnings,
  LogisticsProvider,
  ProviderAnalytics,
  VehicleAsset,
} from "./types";
import type { ProviderSession } from "./rbac";

/**
 * Mock multi-tenant data. Records for a foreign provider (LP-999) are seeded
 * to prove the active tenant (LP-001) never sees cross-tenant rows.
 */

export const currentSession: ProviderSession = {
  providerId: "LP-001",
  displayName: "Atlas Freight Ltd.",
  kind: "Transport Company",
  role: "provider_owner",
};

export const provider: LogisticsProvider = {
  id: "LP-001",
  kind: "Transport Company",
  displayName: "Atlas Freight Ltd.",
  phone: "+212 522 000 111",
  email: "ops@atlasfreight.ma",
  country: "Morocco",
  city: "Casablanca",
  address: "Zone Industrielle Sidi Bernoussi, Casablanca",
  description:
    "Full-service freight and last-mile logistics company operating a 24-vehicle fleet across Morocco and West Africa. Specialized in port-to-warehouse heavy cargo.",
  availability: "Available Now",
  verification: "Approved",
  rating: 4.8,
  clientsServed: 96,
  completedTrips: 412,
  whatsapp: "212522000111",
  documents: [
    { id: "d1", label: "Commercial Registry", type: "Commercial Registry", fileName: "registre_commerce.pdf", uploadedAt: "2024-02-10" },
    { id: "d2", label: "Transport License", type: "Transport License", fileName: "transport_license.pdf", uploadedAt: "2024-02-10" },
  ],
};

export const analytics: ProviderAnalytics = {
  assignedTasks: 9,
  pendingRequests: 4,
  completedDeliveries: 412,
  rating: 4.8,
  earnings: 184200,
};

export const earnings: LogisticsEarnings = {
  today: 1850,
  weekly: 12400,
  monthly: 48600,
  lifetime: 742300,
};

export const vehicles: VehicleAsset[] = [
  { id: "VH-201", providerId: "LP-001", class: "Truck", truckType: "Flatbed", plate: "12345-A-6", maxPayloadKg: 25000, lengthM: 13.6, widthM: 2.5, heightM: 3, manufactureYear: 2021, currentCity: "Casablanca", available: true, imageCount: 4 },
  { id: "VH-202", providerId: "LP-001", class: "Truck", truckType: "Refrigerated", plate: "67890-B-2", maxPayloadKg: 18000, lengthM: 12, widthM: 2.4, heightM: 2.8, manufactureYear: 2020, currentCity: "Tangier", available: false, imageCount: 3 },
  { id: "VH-203", providerId: "LP-001", class: "Van", plate: "44556-C-1", maxPayloadKg: 1500, currentCity: "Casablanca", available: true, imageCount: 2 },
  { id: "VH-204", providerId: "LP-001", class: "Motorcycle", plate: "78901-D-9", maxPayloadKg: 20, currentCity: "Rabat", available: true, imageCount: 1 },
];

export const freightOrders: FreightOrder[] = [
  { id: "FR-501", providerId: "LP-001", clientName: "Yassine El Amrani", clientCountry: "Morocco", origin: "Casablanca Port", destination: "Marrakech Warehouse", cargoType: "Auto parts (palletized)", weightKg: 12000, volumeM3: 38, schedule: "2026-06-12", notes: "Fragile, needs strapping. Loading dock available 8am-4pm.", status: "New", receivedAt: "2026-06-08 10:14" },
  { id: "FR-502", providerId: "LP-001", clientName: "Sahara Trading", clientCountry: "Algeria", origin: "Tangier Med", destination: "Oujda Depot", cargoType: "Electronics", weightKg: 6500, volumeM3: 22, schedule: "2026-06-14", notes: "Temperature-controlled preferred.", status: "New", receivedAt: "2026-06-08 12:40" },
  { id: "FR-503", providerId: "LP-001", clientName: "Gulf Auto LLC", clientCountry: "UAE", origin: "Casablanca Hub", destination: "Agadir Port", cargoType: "Machinery", weightKg: 20000, volumeM3: 45, schedule: "2026-06-10", notes: "Heavy single unit, crane needed at dropoff.", status: "Quoted", receivedAt: "2026-06-06 08:30" },
];

export const activeTrips: ActiveTrip[] = [
  {
    id: "TRIP-7001",
    providerId: "LP-001",
    clientName: "Atlas Motors",
    orderDate: "2026-06-05",
    goods: "Alternators & brake kits (palletized)",
    weightKg: 9400,
    origin: "Casablanca Port",
    destination: "Fès Distribution Center",
    stage: "In Transit",
    updates: [
      { id: "u1", tripId: "TRIP-7001", message: "Task accepted by Atlas Freight", stage: "Accepted", at: "2026-06-05 09:00" },
      { id: "u2", tripId: "TRIP-7001", message: "En route to Casablanca Port", stage: "En Route to Pickup", at: "2026-06-05 10:30" },
      { id: "u3", tripId: "TRIP-7001", message: "Cargo securely loaded onto truck bed", stage: "Cargo Loaded/Received", at: "2026-06-05 13:15" },
      { id: "u4", tripId: "TRIP-7001", message: "En route to destination", stage: "In Transit", at: "2026-06-05 14:00" },
    ],
  },
  {
    id: "TRIP-7002",
    providerId: "LP-001",
    clientName: "Sahara Trading",
    orderDate: "2026-06-07",
    goods: "Consumer electronics",
    weightKg: 6500,
    origin: "Tangier Med",
    destination: "Oujda Depot",
    stage: "Accepted",
    updates: [
      { id: "u5", tripId: "TRIP-7002", message: "Task accepted", stage: "Accepted", at: "2026-06-07 16:20" },
    ],
  },
];

export const chatThreads: ChatThread[] = [
  {
    id: "TH-1",
    providerId: "LP-001",
    party: "Atlas Motors",
    kind: "Client",
    lastPreview: "What's the ETA for the Fès delivery?",
    unread: 2,
    messages: [
      { id: "m1", threadId: "TH-1", from: "client", text: "Hello, any update on TRIP-7001?", at: "13:40" },
      { id: "m2", threadId: "TH-1", from: "provider", text: "Cargo loaded and in transit. ETA tomorrow morning.", at: "14:05" },
      { id: "m3", threadId: "TH-1", from: "client", text: "What's the ETA for the Fès delivery?", at: "14:20" },
    ],
  },
  {
    id: "TH-2",
    providerId: "LP-001",
    party: "Platform Support",
    kind: "Platform Support",
    lastPreview: "Your verification documents are approved.",
    unread: 0,
    messages: [
      { id: "m4", threadId: "TH-2", from: "support", text: "Your verification documents are approved.", at: "Mon" },
    ],
  },
];

/* --- Foreign-tenant noise: must NEVER surface for LP-001 --- */
export const foreignVehicles: VehicleAsset[] = [
  { id: "VH-901", providerId: "LP-999", class: "Truck", plate: "00000-Z-0", maxPayloadKg: 10000, currentCity: "Nowhere", available: true, imageCount: 0 },
];

/* --- Public directory for the buyer search interface --- */
export const publicProviders: (LogisticsProvider & { topPayloadKg: number; vehicleClasses: string[] })[] = [
  { ...provider, topPayloadKg: 25000, vehicleClasses: ["Truck", "Van", "Motorcycle"] },
  {
    id: "LP-002", kind: "Independent Driver", displayName: "Mohamed Adil", phone: "+212 600 111 222", email: "adil@driver.ma",
    country: "Morocco", city: "Agadir", address: "Agadir", description: "Owner-operator with refrigerated truck for perishable cargo.",
    availability: "Busy", verification: "Approved", rating: 4.6, clientsServed: 38, completedTrips: 154, whatsapp: "212600111222",
    documents: [], topPayloadKg: 12000, vehicleClasses: ["Truck"],
  },
  {
    id: "LP-003", kind: "Transport Company", displayName: "Rapid Movers SARL", phone: "+212 661 333 444", email: "dispatch@rapidmovers.ma",
    country: "Morocco", city: "Rabat", address: "Rabat", description: "Urban last-mile delivery fleet of vans and motorcycles.",
    availability: "Available Now", verification: "Pending", rating: 4.3, clientsServed: 21, completedTrips: 88, whatsapp: "212661333444",
    documents: [], topPayloadKg: 1500, vehicleClasses: ["Van", "Motorcycle"],
  },
];

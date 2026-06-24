import type {
  ChatThread,
  SpaceBookingRequest,
  WarehouseAnalytics,
  WarehouseEarnings,
  WarehouseFacility,
  WarehouseOperator,
} from "./types";
import type { OperatorSession } from "./rbac";

/**
 * Mock multi-tenant data. A foreign operator (WO-999) is seeded to prove the
 * active tenant (WO-001) never sees cross-tenant listings.
 */

export const currentSession: OperatorSession = {
  operatorId: "WO-001",
  displayName: "Casablanca Storage Hub",
  kind: "Storage Company",
  role: "operator_owner",
};

export const operator: WarehouseOperator = {
  id: "WO-001",
  kind: "Storage Company",
  fullName: "Omar Bennani",
  companyName: "Casablanca Storage Hub",
  email: "ops@casastorage.ma",
  phone: "+212 522 444 555",
  country: "Morocco",
  city: "Casablanca",
  address: "Zone Logistique, Ain Sebaa, Casablanca",
  description:
    "Modern multi-category storage facilities near Casablanca Port, offering bonded, cold, and general warehousing with 24/7 security and customs support.",
  verification: "Approved",
  rating: 4.7,
  whatsapp: "212522444555",
  documents: [
    { id: "d1", label: "Commercial Registry", type: "Commercial Registry", fileName: "registre_commerce.pdf", uploadedAt: "2024-03-01" },
    { id: "d2", label: "Business Activity License", type: "Business Activity License", fileName: "activity_license.pdf", uploadedAt: "2024-03-01" },
    { id: "d3", label: "Property Ownership", type: "Property/Lease Proof", fileName: "property_deed.pdf", uploadedAt: "2024-03-01" },
  ],
};

export const analytics: WarehouseAnalytics = {
  totalWarehouses: 3,
  lifetimeBookings: 218,
  activeContracts: 14,
  completedBookings: 196,
  grossRevenue: 1284000,
};

export const earnings: WarehouseEarnings = {
  today: 2400,
  weekly: 16800,
  monthly: 68400,
  lifetime: 1284000,
};

export const facilities: WarehouseFacility[] = [
  {
    id: "WH-201",
    operatorId: "WO-001",
    name: "Ain Sebaa Bonded Warehouse",
    category: "Bonded/Cargo",
    country: "Morocco",
    city: "Casablanca",
    address: "Zone Logistique, Ain Sebaa",
    coordinates: "33.6066, -7.5247",
    imageCount: 8,
    totalAreaSqm: 12000,
    availableSqm: 4200,
    floors: 1,
    clearanceHeightM: 12,
    floorType: "Reinforced concrete",
    pricing: { daily: 0.15, weekly: 0.9, monthly: 4.5, annual: 48 },
    services: [
      { key: "loading", label: "Loading / Unloading", enabled: true, price: 120 },
      { key: "security", label: "24/7 Security Guards", enabled: true, price: 0 },
      { key: "cctv", label: "CCTV Monitoring", enabled: true, price: 0 },
      { key: "insurance", label: "Cargo Insurance", enabled: true, price: 80 },
      { key: "packaging", label: "Packaging / Palletizing", enabled: false, price: 0 },
    ],
    availability: "Available for Booking",
    verification: "Approved",
  },
  {
    id: "WH-202",
    operatorId: "WO-001",
    name: "Port Cold Storage Facility",
    category: "Cold Storage",
    country: "Morocco",
    city: "Casablanca",
    address: "Port Zone B",
    coordinates: "33.6020, -7.6100",
    imageCount: 6,
    totalAreaSqm: 5000,
    availableSqm: 0,
    floors: 2,
    clearanceHeightM: 8,
    floorType: "Insulated epoxy",
    pricing: { daily: 0.35, weekly: 2.1, monthly: 9.5, annual: 102 },
    services: [
      { key: "loading", label: "Loading / Unloading", enabled: true, price: 150 },
      { key: "security", label: "24/7 Security Guards", enabled: true, price: 0 },
      { key: "cctv", label: "CCTV Monitoring", enabled: true, price: 0 },
      { key: "insurance", label: "Cargo Insurance", enabled: true, price: 110 },
      { key: "packaging", label: "Packaging / Palletizing", enabled: true, price: 60 },
    ],
    availability: "Full/Max Capacity",
    verification: "Approved",
  },
  {
    id: "WH-203",
    operatorId: "WO-001",
    name: "Bouskoura General Depot",
    category: "General",
    country: "Morocco",
    city: "Bouskoura",
    address: "Industrial Park, Bouskoura",
    coordinates: "33.4500, -7.6500",
    imageCount: 4,
    totalAreaSqm: 8000,
    availableSqm: 6500,
    floors: 1,
    clearanceHeightM: 10,
    floorType: "Polished concrete",
    pricing: { daily: 0.12, weekly: 0.7, monthly: 3.8, annual: 40 },
    services: [
      { key: "loading", label: "Loading / Unloading", enabled: true, price: 90 },
      { key: "security", label: "24/7 Security Guards", enabled: false, price: 0 },
      { key: "cctv", label: "CCTV Monitoring", enabled: true, price: 0 },
      { key: "insurance", label: "Cargo Insurance", enabled: false, price: 0 },
      { key: "packaging", label: "Packaging / Palletizing", enabled: false, price: 0 },
    ],
    availability: "Temporarily Closed",
    verification: "Pending",
  },
];

export const bookingRequests: SpaceBookingRequest[] = [
  { id: "BK-501", operatorId: "WO-001", facilityId: "WH-201", facilityName: "Ain Sebaa Bonded Warehouse", clientName: "Yassine El Amrani", clientCountry: "Morocco", cargoDescription: "Auto parts (palletized, 18 pallets)", spaceSqm: 600, durationDays: 90, startDate: "2026-06-20", status: "New", receivedAt: "2026-06-08 09:30" },
  { id: "BK-502", operatorId: "WO-001", facilityId: "WH-203", facilityName: "Bouskoura General Depot", clientName: "Sahara Trading", clientCountry: "Algeria", cargoDescription: "Textiles in bulk cartons", spaceSqm: 1200, durationDays: 30, startDate: "2026-06-15", status: "New", receivedAt: "2026-06-08 11:10" },
  { id: "BK-503", operatorId: "WO-001", facilityId: "WH-201", facilityName: "Ain Sebaa Bonded Warehouse", clientName: "Gulf Auto LLC", clientCountry: "UAE", cargoDescription: "Machinery components", spaceSqm: 900, durationDays: 180, startDate: "2026-07-01", status: "Quoted", receivedAt: "2026-06-06 14:05" },
];

export const chatThreads: ChatThread[] = [
  {
    id: "TH-1",
    operatorId: "WO-001",
    clientName: "Yassine El Amrani",
    clientCountry: "Morocco",
    lastPreview: "Is the bonded warehouse customs-cleared?",
    unread: 2,
    messages: [
      { id: "m1", threadId: "TH-1", from: "client", text: "Hi, interested in 600 sqm for 3 months.", at: "09:20" },
      { id: "m2", threadId: "TH-1", from: "operator", text: "Hello Yassine, we have space available at Ain Sebaa. Bonded with customs support.", at: "09:25" },
      { id: "m3", threadId: "TH-1", from: "client", text: "Is the bonded warehouse customs-cleared?", at: "09:30" },
    ],
  },
  {
    id: "TH-2",
    operatorId: "WO-001",
    clientName: "Gulf Auto LLC",
    clientCountry: "UAE",
    lastPreview: "Quotation received, reviewing.",
    unread: 0,
    messages: [
      { id: "m4", threadId: "TH-2", from: "operator", text: "Quotation sent for 900 sqm / 6 months.", at: "Yesterday" },
      { id: "m5", threadId: "TH-2", from: "client", text: "Quotation received, reviewing.", at: "Yesterday" },
    ],
  },
];

/* --- Foreign-tenant noise: must NEVER surface for WO-001 --- */
export const foreignFacilities: WarehouseFacility[] = [
  {
    id: "WH-901", operatorId: "WO-999", name: "Competitor Depot", category: "General",
    country: "Morocco", city: "Nowhere", address: "—", coordinates: "0,0", imageCount: 0,
    totalAreaSqm: 100, availableSqm: 100, floors: 1, clearanceHeightM: 5, floorType: "Concrete",
    pricing: { daily: 1, weekly: 5, monthly: 20, annual: 200 }, services: [],
    availability: "Available for Booking", verification: "Approved",
  },
];

/* --- Public directory for the buyer search interface --- */
export const publicFacilities: (WarehouseFacility & { operatorName: string; rating: number })[] =
  facilities
    .filter((f) => f.verification === "Approved")
    .map((f) => ({ ...f, operatorName: operator.companyName ?? operator.fullName, rating: operator.rating }))
    .concat([
      {
        id: "WH-301", operatorId: "WO-002", name: "Tangier Med Container Yard", category: "Container Yard",
        country: "Morocco", city: "Tangier", address: "Tangier Med Port", coordinates: "35.8838, -5.5085",
        imageCount: 5, totalAreaSqm: 20000, availableSqm: 8000, floors: 1, clearanceHeightM: 0, floorType: "Asphalt",
        pricing: { daily: 0.1, weekly: 0.6, monthly: 3.2, annual: 34 },
        services: [
          { key: "loading", label: "Loading / Unloading", enabled: true, price: 100 },
          { key: "security", label: "24/7 Security Guards", enabled: true, price: 0 },
          { key: "cctv", label: "CCTV Monitoring", enabled: true, price: 0 },
          { key: "insurance", label: "Cargo Insurance", enabled: false, price: 0 },
          { key: "packaging", label: "Packaging / Palletizing", enabled: false, price: 0 },
        ],
        availability: "Available for Booking", verification: "Approved",
        operatorName: "Tangier Med Logistics", rating: 4.5,
      },
    ]);

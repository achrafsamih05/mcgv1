import type {
  DealContract,
  ImporterAnalytics,
  ImporterUser,
  LogisticsBooking,
  MarketFleet,
  MarketProduct,
  MarketSupplier,
  MarketWarehouse,
  SourcingRFQ,
  SupplierQuotation,
  TrackingTimelineState,
} from "./types";
import type { ImporterSession } from "./rbac";

/**
 * Mock user-bound data. Foreign records (IMP-999) are seeded to prove the
 * active importer (IMP-001) never sees another importer's RFQs or deals.
 */

export const currentSession: ImporterSession = {
  importerId: "IMP-001",
  fullName: "Yassine El Amrani",
  role: "importer_owner",
};

export const importer: ImporterUser = {
  id: "IMP-001",
  fullName: "Yassine El Amrani",
  companyName: "Amrani Import Co.",
  country: "Morocco",
  city: "Casablanca",
  phone: "+212 661 234 567",
  email: "yassine@amrani-import.ma",
  industry: "Automotive",
  interestCategories: ["Cars & Vehicles", "Heavy Equipment", "Electronics"],
  volumeTier: "$250K – $1M / year",
};

export const analytics: ImporterAnalytics = {
  activeRFQs: 4,
  ongoingDeals: 2,
  liveShipments: 3,
  savedSuppliers: 12,
  unreadAlerts: 5,
};

export const rfqs: SourcingRFQ[] = [
  { id: "RFQ-1001", importerId: "IMP-001", title: "OEM Brake Pad Sets", category: "Cars & Vehicles", quantity: 1200, targetBudget: 11000, specifications: "Ceramic compound, branded boxes, recurring monthly.", deliveryTimeline: "Within 45 days", attachments: 2, status: "Quotations Received", createdAt: "2026-06-02", quotationCount: 3 },
  { id: "RFQ-1002", importerId: "IMP-001", title: "Excavator CAT 320 Units", category: "Heavy Equipment", quantity: 3, targetBudget: 240000, specifications: "Used/refurbished acceptable, low hours, EU spec.", deliveryTimeline: "Within 90 days", attachments: 4, status: "Supplier Matched", createdAt: "2026-06-04", quotationCount: 1 },
  { id: "RFQ-1003", importerId: "IMP-001", title: "LED Headlight Kits", category: "Electronics", quantity: 900, targetBudget: 13500, specifications: "6000K, CE certified, mixed beam patterns.", deliveryTimeline: "Within 30 days", attachments: 1, status: "In Review", createdAt: "2026-06-06", quotationCount: 0 },
  { id: "RFQ-1004", importerId: "IMP-001", title: "Office Furniture Bulk", category: "Furniture", quantity: 500, targetBudget: 42500, specifications: "Ergonomic chairs + desks, flat-pack.", deliveryTimeline: "Within 60 days", attachments: 0, status: "New", createdAt: "2026-06-08", quotationCount: 0 },
];

export const quotations: SupplierQuotation[] = [
  { id: "Q-5001", rfqId: "RFQ-1001", importerId: "IMP-001", supplierName: "Guangzhou AutoParts Co.", supplierCountry: "China", unitPrice: 8.5, quantity: 1200, productionDays: 25, shippingDays: 32, shippingMode: "Marine", remarks: "Branded packaging included. 2% discount above 2000 units.", status: "Pending" },
  { id: "Q-5002", rfqId: "RFQ-1001", importerId: "IMP-001", supplierName: "Foshan Parts Group", supplierCountry: "China", unitPrice: 7.9, quantity: 1200, productionDays: 30, shippingDays: 34, shippingMode: "Marine", remarks: "Lower price, generic packaging. MOQ 1000.", status: "Pending" },
  { id: "Q-5003", rfqId: "RFQ-1001", importerId: "IMP-001", supplierName: "Ningbo Express Auto", supplierCountry: "China", unitPrice: 9.2, quantity: 1200, productionDays: 18, shippingDays: 7, shippingMode: "Air", remarks: "Fastest turnaround, air freight, premium QC.", status: "Pending" },
  { id: "Q-5004", rfqId: "RFQ-1002", importerId: "IMP-001", supplierName: "Jinan Heavy Machinery", supplierCountry: "China", unitPrice: 78000, quantity: 3, productionDays: 40, shippingDays: 38, shippingMode: "Marine", remarks: "Refurbished, 12-month warranty, EU emission spec.", status: "Pending" },
];

export const deals: DealContract[] = [
  { id: "DEAL-3001", importerId: "IMP-001", rfqTitle: "Cotton T-Shirts Bulk", supplierName: "Guangzhou Textiles", supplierCountry: "China", valuation: 40000, executedAt: "2026-05-25" },
  { id: "DEAL-3002", importerId: "IMP-001", rfqTitle: "Industrial Compressors", supplierName: "Shanghai Machinery", supplierCountry: "China", valuation: 86000, executedAt: "2026-05-30" },
];

export const shipments: TrackingTimelineState[] = [
  {
    id: "SHP-7001",
    importerId: "IMP-001",
    shipmentRef: "SHP-7001",
    product: "Cotton T-Shirts x10k",
    supplierName: "Guangzhou Textiles",
    currentMilestone: "In Transit/Shipping",
    events: [
      { id: "e1", milestone: "Request Received", note: "RFQ submitted", at: "2026-05-10 09:00" },
      { id: "e2", milestone: "Supplier Found", note: "Matched with Guangzhou Textiles", at: "2026-05-12 14:00" },
      { id: "e3", milestone: "Negotiation", note: "Terms agreed at $4/unit", at: "2026-05-15 11:00" },
      { id: "e4", milestone: "In Production", note: "Production started", at: "2026-05-18 08:00" },
      { id: "e5", milestone: "Cargo Ready", note: "Goods ready, QC passed", at: "2026-06-01 16:00" },
      { id: "e6", milestone: "In Transit/Shipping", note: "Departed Guangzhou Port", at: "2026-06-05 10:00" },
    ],
  },
  {
    id: "SHP-7002",
    importerId: "IMP-001",
    shipmentRef: "SHP-7002",
    product: "Industrial Compressors x6",
    supplierName: "Shanghai Machinery",
    currentMilestone: "In Production",
    events: [
      { id: "e7", milestone: "Request Received", note: "RFQ submitted", at: "2026-05-28 09:00" },
      { id: "e8", milestone: "Supplier Found", note: "Matched with Shanghai Machinery", at: "2026-05-29 10:00" },
      { id: "e9", milestone: "Negotiation", note: "Contract executed", at: "2026-05-30 15:00" },
      { id: "e10", milestone: "In Production", note: "Manufacturing in progress", at: "2026-06-02 08:00" },
    ],
  },
];

export const bookings: LogisticsBooking[] = [
  { id: "LB-9001", importerId: "IMP-001", kind: "Warehouse", providerName: "Casablanca Storage Hub", detail: "600 sqm · 90 days · bonded", status: "Booked", createdAt: "2026-06-03" },
  { id: "LB-9002", importerId: "IMP-001", kind: "Transport", providerName: "Atlas Freight Ltd.", detail: "Port → Marrakech · 12t flatbed", status: "Inquiry", createdAt: "2026-06-07" },
];

/* --- Foreign-user noise: must NEVER surface for IMP-001 --- */
export const foreignRFQs: SourcingRFQ[] = [
  { id: "RFQ-9999", importerId: "IMP-999", title: "Competitor RFQ", category: "General Products", quantity: 1, targetBudget: 1, specifications: "—", deliveryTimeline: "—", attachments: 0, status: "New", createdAt: "2026-01-01", quotationCount: 0 },
];

/* --- Marketplace browse data (public, read-only) --- */
export const marketProducts: MarketProduct[] = [
  { id: "MP-1", name: "Brake Pad Set (OEM)", category: "Cars & Vehicles", supplierName: "Guangzhou AutoParts Co.", originCountry: "China", priceMin: 8, priceMax: 14, moq: 500 },
  { id: "MP-2", name: "Excavator CAT 320", category: "Heavy Equipment", supplierName: "Jinan Heavy Machinery", originCountry: "China", priceMin: 72000, priceMax: 82000, moq: 1 },
  { id: "MP-3", name: "LED Smart TV 55\"", category: "Electronics", supplierName: "Shenzhen TechWorks", originCountry: "China", priceMin: 290, priceMax: 340, moq: 100 },
  { id: "MP-4", name: "Ergonomic Office Chair", category: "Furniture", supplierName: "Foshan Home & Living", originCountry: "China", priceMin: 65, priceMax: 95, moq: 200 },
  { id: "MP-5", name: "Cotton T-Shirt (Bulk)", category: "Clothing & Fashion", supplierName: "Guangzhou Textiles", originCountry: "China", priceMin: 3, priceMax: 6, moq: 1000 },
  { id: "MP-6", name: "Industrial Air Compressor", category: "Industrial Machines", supplierName: "Shanghai Machinery", originCountry: "China", priceMin: 12000, priceMax: 16000, moq: 2 },
];

export const marketSuppliers: MarketSupplier[] = [
  { id: "MS-1", name: "Guangzhou AutoParts Co.", country: "China", verified: true, rating: 4.9, years: 14, specialization: "Vehicle parts" },
  { id: "MS-2", name: "Shenzhen TechWorks", country: "China", verified: true, rating: 4.8, years: 11, specialization: "Electronics" },
  { id: "MS-3", name: "Jinan Heavy Machinery", country: "China", verified: true, rating: 4.9, years: 18, specialization: "Construction equipment" },
  { id: "MS-4", name: "Foshan Home & Living", country: "China", verified: false, rating: 4.6, years: 9, specialization: "Furniture" },
];

export const marketWarehouses: MarketWarehouse[] = [
  { id: "MW-1", name: "Ain Sebaa Bonded Warehouse", country: "Morocco", city: "Casablanca", availableSqm: 4200, dailyPrice: 0.15 },
  { id: "MW-2", name: "Tangier Med Container Yard", country: "Morocco", city: "Tangier", availableSqm: 8000, dailyPrice: 0.1 },
  { id: "MW-3", name: "Bouskoura General Depot", country: "Morocco", city: "Bouskoura", availableSqm: 6500, dailyPrice: 0.12 },
];

export const marketFleet: MarketFleet[] = [
  { id: "MF-1", name: "Atlas Freight Ltd.", city: "Casablanca", vehicleType: "Truck", rating: 4.8, available: true },
  { id: "MF-2", name: "Mohamed Adil", city: "Agadir", vehicleType: "Truck", rating: 4.6, available: false },
  { id: "MF-3", name: "Rapid Movers SARL", city: "Rabat", vehicleType: "Van", rating: 4.3, available: true },
];

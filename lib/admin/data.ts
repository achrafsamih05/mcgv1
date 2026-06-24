import type {
  ActivityLog,
  Deal,
  Dispute,
  Driver,
  FlaggedMessage,
  LogisticsOrder,
  Product,
  Review,
  Supplier,
  TrackingLog,
  User,
  Warehouse,
} from "./types";

/** Mock data layer. In production these come from the admin API. */

export const users: User[] = [
  { id: "U-1042", name: "Yassine El Amrani", email: "yassine@import.ma", country: "Morocco", accountType: "Buyer", registeredAt: "2026-01-12", status: "Active", verified: true },
  { id: "U-1043", name: "Guangzhou AutoParts Co.", email: "sales@gzauto.cn", country: "China", accountType: "Supplier", registeredAt: "2025-11-03", status: "Active", verified: true },
  { id: "U-1044", name: "Mohamed Adil", email: "adil.driver@mcg.com", country: "Morocco", accountType: "Driver", registeredAt: "2026-02-21", status: "Pending", verified: false },
  { id: "U-1045", name: "Atlas Freight Ltd.", email: "ops@atlasfreight.com", country: "Morocco", accountType: "Transport Company", registeredAt: "2025-09-18", status: "Active", verified: true },
  { id: "U-1046", name: "Casablanca Storage Hub", email: "info@casastorage.ma", country: "Morocco", accountType: "Warehouse", registeredAt: "2025-12-01", status: "Active", verified: true },
  { id: "U-1047", name: "Sara Benali", email: "sara.b@retail.ma", country: "Morocco", accountType: "Buyer", registeredAt: "2026-03-09", status: "Suspended", verified: false },
  { id: "U-1048", name: "Shenzhen TechWorks", email: "contact@sztech.cn", country: "China", accountType: "Supplier", registeredAt: "2025-08-22", status: "Active", verified: true },
  { id: "U-1049", name: "Karim Tazi", email: "karim.tazi@mail.com", country: "Morocco", accountType: "Buyer", registeredAt: "2026-04-15", status: "Banned", verified: false },
  { id: "U-1050", name: "Foshan Home & Living", email: "hello@foshanhome.cn", country: "China", accountType: "Supplier", registeredAt: "2026-01-30", status: "Pending", verified: false },
  { id: "U-1051", name: "Rapid Movers SARL", email: "dispatch@rapidmovers.ma", country: "Morocco", accountType: "Transport Company", registeredAt: "2026-02-02", status: "Active", verified: false },
];

export const pendingSuppliers: Supplier[] = [
  {
    id: "S-301",
    company: "Foshan Home & Living",
    country: "China",
    specialization: "Furniture & Décor",
    submittedAt: "2026-05-28",
    status: "Pending",
    verified: false,
    documents: [
      { id: "d1", label: "Business License", type: "Company Registration", fileName: "license_foshan.pdf", uploadedAt: "2026-05-28" },
      { id: "d2", label: "Export Certificate", type: "Trade Certificate", fileName: "export_cert.pdf", uploadedAt: "2026-05-28" },
      { id: "d3", label: "Tax Registration", type: "Tax File", fileName: "tax_2026.pdf", uploadedAt: "2026-05-28" },
    ],
  },
  {
    id: "S-302",
    company: "Ningbo Electronics Group",
    country: "China",
    specialization: "Consumer Electronics",
    submittedAt: "2026-06-01",
    status: "Pending",
    verified: false,
    documents: [
      { id: "d4", label: "Business License", type: "Company Registration", fileName: "ningbo_license.pdf", uploadedAt: "2026-06-01" },
      { id: "d5", label: "ISO Certificate", type: "Verification", fileName: "iso9001.pdf", uploadedAt: "2026-06-01" },
    ],
  },
  {
    id: "S-303",
    company: "Jinan Heavy Machinery",
    country: "China",
    specialization: "Construction Equipment",
    submittedAt: "2026-06-03",
    status: "Pending",
    verified: false,
    documents: [
      { id: "d6", label: "Business License", type: "Company Registration", fileName: "jinan_license.pdf", uploadedAt: "2026-06-03" },
      { id: "d7", label: "CE Certification", type: "Trade Certificate", fileName: "ce_cert.pdf", uploadedAt: "2026-06-03" },
      { id: "d8", label: "Tax File", type: "Tax File", fileName: "jinan_tax.pdf", uploadedAt: "2026-06-03" },
    ],
  },
];

export const drivers: Driver[] = [
  { id: "D-501", name: "Mohamed Adil", kind: "Driver", country: "Morocco", vehicle: "Volvo FH16 Truck", licenseValid: true, permitValid: true, ownershipVerified: false, status: "Pending", verified: false },
  { id: "D-502", name: "Atlas Freight Ltd.", kind: "Transport Company", country: "Morocco", vehicle: "Fleet of 24", licenseValid: true, permitValid: true, ownershipVerified: true, status: "Active", verified: true },
  { id: "D-503", name: "Hassan Ouattara", kind: "Driver", country: "Morocco", vehicle: "Mercedes Sprinter Van", licenseValid: true, permitValid: false, ownershipVerified: true, status: "Pending", verified: false },
  { id: "D-504", name: "Rapid Movers SARL", kind: "Transport Company", country: "Morocco", vehicle: "Fleet of 11", licenseValid: false, permitValid: true, ownershipVerified: true, status: "Suspended", verified: false },
];

export const warehouses: Warehouse[] = [
  { id: "W-201", name: "Casablanca Storage Hub", city: "Casablanca", coordinates: "33.5731, -7.5898", capacitySqm: 12000, dailyPrice: 0.15, monthlyPrice: 4.5, status: "Approved", verified: true, photos: 8, safetyDocs: 3 },
  { id: "W-202", name: "Tangier Med Logistics", city: "Tangier", coordinates: "35.7595, -5.8340", capacitySqm: 8500, dailyPrice: 0.18, monthlyPrice: 5.2, status: "Pending", verified: false, photos: 6, safetyDocs: 2 },
  { id: "W-203", name: "Agadir Cold Store", city: "Agadir", coordinates: "30.4278, -9.5981", capacitySqm: 6200, dailyPrice: 0.13, monthlyPrice: 3.9, status: "Pending", verified: false, photos: 4, safetyDocs: 1 },
];

export const products: Product[] = [
  { id: "P-9001", name: "Excavator CAT 320", category: "Heavy Equipment", supplier: "Jinan Heavy Machinery", price: 78000, status: "Live", listedAt: "2026-05-10" },
  { id: "P-9002", name: "LED Smart TV 55\"", category: "Electronics", supplier: "Shenzhen TechWorks", price: 320, status: "Live", listedAt: "2026-05-12" },
  { id: "P-9003", name: "Office Chair Ergonomic", category: "Furniture", supplier: "Foshan Home & Living", price: 85, status: "Hidden", listedAt: "2026-05-15" },
  { id: "P-9004", name: "Unbranded Power Bank", category: "Electronics", supplier: "Ningbo Electronics Group", price: 12, status: "Flagged", listedAt: "2026-05-20" },
  { id: "P-9005", name: "Cotton T-Shirt Bulk", category: "Fashion", supplier: "Guangzhou Textiles", price: 4, status: "Live", listedAt: "2026-05-22" },
];

export const orders: LogisticsOrder[] = [
  { id: "O-7001", product: "Excavator CAT 320", buyer: "Yassine El Amrani", supplier: "Jinan Heavy Machinery", origin: "Shanghai", destination: "Casablanca", stage: "Shipping", value: 78000, updatedAt: "2026-06-07" },
  { id: "O-7002", product: "LED Smart TV 55\" x200", buyer: "Sara Benali", supplier: "Shenzhen TechWorks", origin: "Shenzhen", destination: "Tangier", stage: "Production", value: 64000, updatedAt: "2026-06-06" },
  { id: "O-7003", product: "Office Chairs x500", buyer: "Karim Tazi", supplier: "Foshan Home & Living", origin: "Foshan", destination: "Rabat", stage: "Negotiation", value: 42500, updatedAt: "2026-06-05" },
  { id: "O-7004", product: "Cotton T-Shirts x10k", buyer: "Yassine El Amrani", supplier: "Guangzhou Textiles", origin: "Guangzhou", destination: "Casablanca", stage: "Delivered", value: 40000, updatedAt: "2026-06-01" },
];

export const trackingLogs: TrackingLog[] = [
  { id: "L1", message: "Cargo loaded at Shanghai Port", timestamp: "2026-06-04 09:12", author: "System" },
  { id: "L2", message: "Shipment departed China", timestamp: "2026-06-05 18:40", author: "CEO Override" },
  { id: "L3", message: "Vessel passing Suez Canal", timestamp: "2026-06-07 02:15", author: "System" },
];

export const deals: Deal[] = [
  { id: "DL-401", buyer: "Yassine El Amrani", supplier: "Jinan Heavy Machinery", amount: 78000, status: "Escrow Held", createdAt: "2026-05-30" },
  { id: "DL-402", buyer: "Sara Benali", supplier: "Shenzhen TechWorks", amount: 64000, status: "Negotiating", createdAt: "2026-06-02" },
  { id: "DL-403", buyer: "Karim Tazi", supplier: "Foshan Home & Living", amount: 42500, status: "Mediation", createdAt: "2026-06-03" },
  { id: "DL-404", buyer: "Yassine El Amrani", supplier: "Guangzhou Textiles", amount: 40000, status: "Released", createdAt: "2026-05-25" },
];

export const disputes: Dispute[] = [
  { id: "DS-88", axis: "Buyer vs Supplier", claimant: "Karim Tazi", respondent: "Foshan Home & Living", subject: "Goods not matching specs", amount: 42500, status: "Under Review", openedAt: "2026-06-04", evidence: 5 },
  { id: "DS-89", axis: "Buyer vs Driver", claimant: "Sara Benali", respondent: "Hassan Ouattara", subject: "Damaged shipment on delivery", amount: 3200, status: "Open", openedAt: "2026-06-06", evidence: 3 },
  { id: "DS-90", axis: "Buyer vs Warehouse", claimant: "Yassine El Amrani", respondent: "Tangier Med Logistics", subject: "Overcharged storage fees", amount: 1800, status: "Open", openedAt: "2026-06-07", evidence: 2 },
];

export const flaggedMessages: FlaggedMessage[] = [
  { id: "M-11", from: "Karim Tazi", to: "Foshan Home & Living", excerpt: "If you don't refund I will...", reason: "Threatening language", reportedAt: "2026-06-06 14:22" },
  { id: "M-12", from: "Unknown Buyer", to: "Shenzhen TechWorks", excerpt: "Let's settle off-platform via...", reason: "Off-platform circumvention", reportedAt: "2026-06-07 08:05" },
  { id: "M-13", from: "Rapid Movers SARL", to: "Sara Benali", excerpt: "Contact me on this number...", reason: "Spam / contact sharing", reportedAt: "2026-06-07 10:48" },
];

export const reviews: Review[] = [
  { id: "R-71", author: "Yassine El Amrani", target: "Jinan Heavy Machinery", rating: 5, comment: "Excellent machinery, fast shipping.", status: "Published", createdAt: "2026-06-02" },
  { id: "R-72", author: "Anonymous", target: "Shenzhen TechWorks", rating: 1, comment: "Scam!!! buy from competitor X instead", status: "Flagged", createdAt: "2026-06-05" },
  { id: "R-73", author: "Sara Benali", target: "Atlas Freight Ltd.", rating: 4, comment: "Reliable delivery, minor delay.", status: "Published", createdAt: "2026-06-06" },
];

export const activityLogs: ActivityLog[] = [
  { id: "A-5001", operatorId: "CEO-001", operator: "CEO (Owner)", resource: "User U-1049", action: "Account Banned", before: "Active", after: "Banned", timestamp: "2026-06-07 11:02:14" },
  { id: "A-5002", operatorId: "CEO-001", operator: "CEO (Owner)", resource: "Supplier S-300", action: "Verification Approved", before: "Pending", after: "Approved", timestamp: "2026-06-07 10:41:55" },
  { id: "A-5003", operatorId: "STAFF-014", operator: "Ops Manager", resource: "Order O-7001", action: "Stage Override", before: "Production", after: "Shipping", timestamp: "2026-06-07 09:30:08" },
  { id: "A-5004", operatorId: "CEO-001", operator: "CEO (Owner)", resource: "Product P-9004", action: "Listing Hidden", before: "Live", after: "Flagged", timestamp: "2026-06-06 17:12:43" },
  { id: "A-5005", operatorId: "STAFF-009", operator: "Finance Lead", resource: "Deal DL-404", action: "Escrow Released", before: "Escrow Held", after: "Released", timestamp: "2026-06-06 15:55:21" },
];

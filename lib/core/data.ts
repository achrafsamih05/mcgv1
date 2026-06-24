import type {
  AuditTrailLog,
  DemandHeatItem,
  DisputeCase,
  EscrowContract,
  ExecutiveKPIs,
  FederatedSearchResults,
  ManagedDocument,
  PipelineRecord,
  PlatformNotification,
  SupportTicket,
} from "./types";

export const documents: ManagedDocument[] = [
  { id: "DOC-1", name: "commercial_invoice_7741.pdf", kind: "Invoice", format: "PDF", entityType: "Order", entityId: "O-7741", sizeKb: 248, uploadedBy: "Amrani Import Co.", uploadedAt: "2026-06-01" },
  { id: "DOC-2", name: "packing_list_7741.pdf", kind: "Packing List", format: "PDF", entityType: "Order", entityId: "O-7741", sizeKb: 132, uploadedBy: "Guangzhou Textiles", uploadedAt: "2026-06-01" },
  { id: "DOC-3", name: "bill_of_lading_SHP7001.pdf", kind: "Bill of Lading", format: "PDF", entityType: "Shipment", entityId: "SHP-7001", sizeKb: 420, uploadedBy: "Atlas Freight Ltd.", uploadedAt: "2026-06-05" },
  { id: "DOC-4", name: "supply_contract_3001.docx", kind: "Legal Contract", format: "DOCX", entityType: "Deal", entityId: "DEAL-3001", sizeKb: 88, uploadedBy: "MCG Legal", uploadedAt: "2026-05-25" },
  { id: "DOC-5", name: "cargo_photo_loaded.jpg", kind: "Packing List", format: "Image", entityType: "Shipment", entityId: "SHP-7001", sizeKb: 1840, uploadedBy: "Atlas Freight Ltd.", uploadedAt: "2026-06-05" },
];

export const escrowContracts: EscrowContract[] = [
  { id: "ESC-3001", buyerId: "IMP-001", buyerName: "Amrani Import Co.", supplierId: "SUP-010", supplierName: "Guangzhou Textiles", grossValuation: 40000, state: "Completed", documentIds: ["DOC-4"], createdAt: "2026-05-25" },
  { id: "ESC-3002", buyerId: "IMP-001", buyerName: "Amrani Import Co.", supplierId: "SUP-011", supplierName: "Shanghai Machinery", grossValuation: 86000, state: "In Progress/Execution", documentIds: [], createdAt: "2026-05-30" },
  { id: "ESC-3003", buyerId: "IMP-002", buyerName: "Sahara Trading", supplierId: "SUP-001", supplierName: "Guangzhou AutoParts Co.", grossValuation: 11000, state: "Agreed/Contracted", documentIds: [], createdAt: "2026-06-03" },
  { id: "ESC-3004", buyerId: "IMP-003", buyerName: "Gulf Auto LLC", supplierId: "SUP-012", supplierName: "Jinan Heavy Machinery", grossValuation: 240000, state: "In Negotiation", documentIds: [], createdAt: "2026-06-05" },
  { id: "ESC-3005", buyerId: "IMP-001", buyerName: "Amrani Import Co.", supplierId: "SUP-013", supplierName: "Ningbo Electronics", grossValuation: 13500, state: "Open", documentIds: [], createdAt: "2026-06-08" },
];

export const disputes: DisputeCase[] = [
  {
    id: "DSP-88",
    axis: "Buyer vs Supplier",
    claimant: "Karim Tazi",
    respondent: "Foshan Home & Living",
    subject: "Goods not matching specs",
    claimText: "40 of 500 chairs arrived with broken frames. Requesting partial refund of $3,400.",
    amount: 3400,
    status: "Under Review",
    filedAt: "2026-06-04",
    evidence: [
      { id: "ev1", label: "damage_photo_1.jpg", kind: "photo" },
      { id: "ev2", label: "damage_photo_2.jpg", kind: "photo" },
      { id: "ev3", label: "inspection_report.pdf", kind: "document" },
    ],
    chatTrail: [
      { id: "c1", from: "Karim Tazi", text: "The chairs arrived damaged, I want a refund.", at: "10:02" },
      { id: "c2", from: "Foshan Home & Living", text: "We packed per spec, likely transit damage.", at: "10:14" },
      { id: "c3", from: "Karim Tazi", text: "Attaching photos, 40 of 500 affected.", at: "10:20" },
    ],
  },
  {
    id: "DSP-89",
    axis: "Buyer vs Driver",
    claimant: "Sara Benali",
    respondent: "Hassan Ouattara",
    subject: "Damaged shipment on delivery",
    claimText: "Electronics carton crushed on arrival. Driver reportedly stacked heavy cargo on top.",
    amount: 3200,
    status: "Filed",
    filedAt: "2026-06-06",
    evidence: [{ id: "ev4", label: "crushed_carton.jpg", kind: "photo" }],
    chatTrail: [
      { id: "c4", from: "Sara Benali", text: "The carton was crushed on delivery.", at: "08:40" },
    ],
  },
  {
    id: "DSP-90",
    axis: "Buyer vs Warehouse",
    claimant: "Amrani Import Co.",
    respondent: "Tangier Med Logistics",
    subject: "Overcharged storage fees",
    claimText: "Billed for 120 days but goods were stored 90 days. Disputing $1,800 overcharge.",
    amount: 1800,
    status: "Filed",
    filedAt: "2026-06-07",
    evidence: [{ id: "ev5", label: "invoice_dispute.pdf", kind: "document" }],
    chatTrail: [],
  },
];

export const pipeline: PipelineRecord[] = [
  { id: "PL-7001", product: "Cotton T-Shirts x10k", buyerName: "Amrani Import Co.", supplierName: "Guangzhou Textiles", stage: "Freight/Shipping", valuation: 40000, updatedAt: "2026-06-05" },
  { id: "PL-7002", product: "Industrial Compressors x6", buyerName: "Amrani Import Co.", supplierName: "Shanghai Machinery", stage: "Manufacturing/Production", valuation: 86000, updatedAt: "2026-06-02" },
  { id: "PL-7003", product: "Excavator CAT 320 x3", buyerName: "Gulf Auto LLC", supplierName: "Jinan Heavy Machinery", stage: "Negotiation", valuation: 240000, updatedAt: "2026-06-05" },
  { id: "PL-7004", product: "Brake Pad Sets x1200", buyerName: "Sahara Trading", supplierName: "Guangzhou AutoParts Co.", stage: "Warehousing/Storage", valuation: 11000, updatedAt: "2026-06-07" },
  { id: "PL-7005", product: "LED TVs x200", buyerName: "Sara Benali", supplierName: "Shenzhen TechWorks", stage: "Last-Mile Transport", valuation: 64000, updatedAt: "2026-06-08" },
];

export const auditLogs: AuditTrailLog[] = [
  { id: "AL-1", userId: "CEO-001", userMeta: "CEO (Owner)", action: "Deal State Change", delta: "ESC-3001: In Progress → Completed", isoDate: "2026-06-07", systemTime: "11:02:14.882" },
  { id: "AL-2", userId: "SUP-001", userMeta: "Guangzhou AutoParts", action: "Quote Admittance", delta: "Q-5001 dispatched for RFQ-1001", isoDate: "2026-06-07", systemTime: "10:41:55.201" },
  { id: "AL-3", userId: "LP-001", userMeta: "Atlas Freight", action: "Cargo Tracking Adjustment", delta: "TRIP-7001: Loaded → In Transit", isoDate: "2026-06-07", systemTime: "09:30:08.554" },
  { id: "AL-4", userId: "SUP-001", userMeta: "Guangzhou AutoParts", action: "Product Modification", delta: "PR-1003 price 12→11 USD", isoDate: "2026-06-06", systemTime: "17:12:43.119" },
  { id: "AL-5", userId: "IMP-004", userMeta: "New Importer", action: "Account Creation", delta: "Importer account provisioned", isoDate: "2026-06-06", systemTime: "15:55:21.760" },
  { id: "AL-6", userId: "WO-001", userMeta: "Casablanca Storage", action: "Document Upload", delta: "DOC-3 Bill of Lading attached to SHP-7001", isoDate: "2026-06-05", systemTime: "14:08:30.045" },
];

export const tickets: SupportTicket[] = [
  {
    id: "TKT-501", subject: "Cannot upload bill of lading", category: "Technical", status: "Routed",
    openedBy: "Atlas Freight Ltd.", assignedDivision: "Platform Engineering", createdAt: "2026-06-07",
    replies: [
      { id: "r1", from: "user", text: "PDF upload fails at 5MB.", at: "2026-06-07 09:00" },
      { id: "r2", from: "staff", text: "Routed to engineering, raising the limit to 25MB.", at: "2026-06-07 10:15" },
    ],
  },
  {
    id: "TKT-502", subject: "Escrow release delayed", category: "Payments", status: "Awaiting Reply",
    openedBy: "Amrani Import Co.", assignedDivision: "Finance", createdAt: "2026-06-06",
    replies: [{ id: "r3", from: "user", text: "Funds not released after delivery confirmation.", at: "2026-06-06 12:00" }],
  },
  {
    id: "TKT-503", subject: "How to add a second warehouse?", category: "Account", status: "Resolved",
    openedBy: "Casablanca Storage Hub", createdAt: "2026-06-04",
    replies: [
      { id: "r4", from: "user", text: "Where do I list another facility?", at: "2026-06-04 08:00" },
      { id: "r5", from: "staff", text: "Use Facilities → List Warehouse. Resolved.", at: "2026-06-04 09:30" },
    ],
  },
];

export const notifications: PlatformNotification[] = [
  { id: "N-1", kind: "Quote", title: "New quotation received", body: "Guangzhou AutoParts sent an offer for RFQ-1001.", at: "2m ago", read: false },
  { id: "N-2", kind: "Transit Milestone", title: "Shipment departed", body: "SHP-7001 departed Guangzhou Port.", at: "1h ago", read: false },
  { id: "N-3", kind: "Reservation", title: "Storage booked", body: "600 sqm confirmed at Casablanca Storage Hub.", at: "3h ago", read: false },
  { id: "N-4", kind: "Message", title: "New message", body: "Atlas Freight replied to your thread.", at: "5h ago", read: true },
  { id: "N-5", kind: "Administrative", title: "Verification approved", body: "Your supplier documents were approved.", at: "1d ago", read: true },
];

export const federatedIndex = {
  items: [
    { id: "MP-1", name: "Toyota Hilux Brake Kit", category: "Cars & Vehicles", price: "$8–14" },
    { id: "MP-2", name: "Toyota Corolla Alternator", category: "Cars & Vehicles", price: "$22–35" },
  ],
  corporations: [
    { id: "MS-1", name: "Guangzhou AutoParts Co.", country: "China" },
    { id: "MS-2", name: "Toyota Parts Trading Ltd.", country: "Japan" },
  ],
  operations: [
    { id: "PL-7004", ref: "Brake Pad Sets (Toyota-compatible)", stage: "Warehousing/Storage" },
  ],
  vehicles: [
    { id: "MF-1", name: "Atlas Freight Ltd.", type: "Truck", city: "Casablanca" },
  ],
};

export function runFederatedSearch(query: string): FederatedSearchResults {
  const q = query.toLowerCase();
  const match = <T extends Record<string, string>>(arr: T[], keys: (keyof T)[]) =>
    !q ? arr : arr.filter((row) => keys.some((k) => String(row[k]).toLowerCase().includes(q)));
  return {
    query,
    items: match(federatedIndex.items, ["name", "category"]),
    corporations: match(federatedIndex.corporations, ["name", "country"]),
    operations: match(federatedIndex.operations, ["ref", "stage"]),
    vehicles: match(federatedIndex.vehicles, ["name", "type", "city"]),
  };
}

export const executiveKPIs: ExecutiveKPIs = {
  userAcquisitions: 8412,
  volumetricCommerceCap: 118600000,
  totalOrders: 12907,
  closedDeals: 9331,
  profitMargin: 18.4,
};

export const topItems: DemandHeatItem[] = [
  { label: "Auto Parts", weight: 92 },
  { label: "Electronics", weight: 78 },
  { label: "Heavy Equipment", weight: 64 },
  { label: "Furniture", weight: 47 },
  { label: "Textiles", weight: 39 },
];

export const activeSuppliers: DemandHeatItem[] = [
  { label: "Guangzhou AutoParts", weight: 88 },
  { label: "Shenzhen TechWorks", weight: 81 },
  { label: "Jinan Heavy Machinery", weight: 70 },
  { label: "Foshan Home & Living", weight: 52 },
];

export const distributionCities: DemandHeatItem[] = [
  { label: "Casablanca", weight: 95 },
  { label: "Tangier", weight: 72 },
  { label: "Marrakech", weight: 58 },
  { label: "Agadir", weight: 41 },
  { label: "Rabat", weight: 36 },
];

export const momPerformance = [
  { label: "Jan", value: 1800, secondary: 540 },
  { label: "Feb", value: 2100, secondary: 620 },
  { label: "Mar", value: 1950, secondary: 580 },
  { label: "Apr", value: 2300, secondary: 710 },
  { label: "May", value: 2410, secondary: 760 },
  { label: "Jun", value: 2620, secondary: 820 },
];

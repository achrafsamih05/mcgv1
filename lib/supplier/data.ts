import type {
  B2BProduct,
  ChatThread,
  IncomingRequest,
  Review,
  SupplierAnalytics,
  SupplierProfile,
} from "./types";
import type { SupplierSession } from "./rbac";

/**
 * Mock multi-tenant data. Note that records for TWO suppliers exist here on
 * purpose — the dashboard scopes everything to the active session tenant
 * (SUP-001) so the second supplier's rows (SUP-999) must never appear.
 */

export const currentSession: SupplierSession = {
  supplierId: "SUP-001",
  companyName: "Guangzhou AutoParts Co.",
  role: "supplier_owner",
};

export const supplierProfile: SupplierProfile = {
  id: "SUP-001",
  companyName: "Guangzhou AutoParts Co.",
  country: "China",
  city: "Guangzhou",
  address: "No. 88 Industrial Ave, Baiyun District, Guangzhou",
  phone: "+86 20 1234 5678",
  businessEmail: "sales@gzautoparts.cn",
  website: "https://gzautoparts.cn",
  description:
    "Leading manufacturer of automotive spare parts and vehicle components with 14 years of export experience to over 40 countries. Specialized in OEM and aftermarket parts.",
  businessType: "Manufacturer",
  yearEstablished: 2011,
  totalEmployees: 320,
  targetMarkets: ["North Africa", "Middle East", "Western Europe", "Sub-Saharan Africa"],
  verification: "Approved",
  rating: 4.9,
  reviewCount: 128,
  whatsapp: "8620123456789",
  credentials: [
    { id: "c1", name: "ISO 9001:2015", type: "Trade Certificate", fileName: "iso9001.pdf", issuedAt: "2023-06-01" },
    { id: "c2", name: "Export License — Customs", type: "Export License", fileName: "export_license.pdf", issuedAt: "2024-01-15" },
    { id: "c3", name: "CE Conformity", type: "Trade Certificate", fileName: "ce_cert.pdf", issuedAt: "2023-09-20" },
    { id: "c4", name: "Business Registration", type: "Trade Certificate", fileName: "biz_reg.pdf", issuedAt: "2011-03-10" },
  ],
};

export const analytics: SupplierAnalytics = {
  liveProducts: 24,
  activeOrders: 7,
  unreadMessages: 3,
  pageViews: 4820,
  uniqueBuyers: 186,
};

export const products: B2BProduct[] = [
  { id: "PR-1001", supplierId: "SUP-001", name: "Brake Pad Set (OEM)", category: "Cars & Vehicles", description: "Premium ceramic brake pads for sedans and SUVs.", images: 5, priceMin: 8, priceMax: 14, moq: 500, leadTimeDays: 25, status: "Live", createdAt: "2026-04-01" },
  { id: "PR-1002", supplierId: "SUP-001", name: "Alternator 12V 90A", category: "Cars & Vehicles", description: "High-output alternator compatible with major brands.", images: 4, priceMin: 22, priceMax: 35, moq: 200, leadTimeDays: 30, status: "Live", createdAt: "2026-04-08" },
  { id: "PR-1003", supplierId: "SUP-001", name: "LED Headlight Kit", category: "Electronics", description: "6000K automotive LED headlight conversion kit.", images: 6, priceMin: 12, priceMax: 19, moq: 300, leadTimeDays: 20, status: "Live", createdAt: "2026-04-15" },
  { id: "PR-1004", supplierId: "SUP-001", name: "Suspension Coil Spring", category: "Cars & Vehicles", description: "Heavy-duty coil springs, multiple load ratings.", images: 3, priceMin: 6, priceMax: 11, moq: 800, leadTimeDays: 28, status: "Draft", createdAt: "2026-05-02" },
  { id: "PR-1005", supplierId: "SUP-001", name: "Engine Oil Filter", category: "Cars & Vehicles", description: "Spin-on oil filters, bulk packaging available.", images: 2, priceMin: 1, priceMax: 3, moq: 2000, leadTimeDays: 18, status: "Hidden", createdAt: "2026-05-10" },
];

export const incomingRequests: IncomingRequest[] = [
  { id: "RFQ-501", supplierId: "SUP-001", buyerName: "Yassine El Amrani", buyerCountry: "Morocco", productName: "Brake Pad Set (OEM)", quantity: 1200, targetBudget: 11000, notes: "Need ceramic compound, packaging in branded boxes. Recurring monthly order.", status: "New", receivedAt: "2026-06-08 09:14" },
  { id: "RFQ-502", supplierId: "SUP-001", buyerName: "Atlas Motors", buyerCountry: "Morocco", productName: "Alternator 12V 90A", quantity: 400, targetBudget: 10500, notes: "Compatibility list for Renault & Dacia models required.", status: "New", receivedAt: "2026-06-08 11:42" },
  { id: "RFQ-503", supplierId: "SUP-001", buyerName: "Sahara Trading", buyerCountry: "Algeria", productName: "LED Headlight Kit", quantity: 900, targetBudget: 13500, notes: "Mixed 6000K/4300K. Need CE docs for customs.", status: "Accepted", receivedAt: "2026-06-07 16:05" },
  { id: "RFQ-504", supplierId: "SUP-001", buyerName: "Gulf Auto LLC", buyerCountry: "UAE", productName: "Suspension Coil Spring", quantity: 1500, targetBudget: 12000, notes: "Heavy-load rating for desert terrain vehicles.", status: "Quoted", receivedAt: "2026-06-06 08:30" },
];

export const reviews: Review[] = [
  { id: "RV-1", supplierId: "SUP-001", buyerName: "Yassine El Amrani", rating: 5, comment: "Excellent quality brake pads, shipped on time. Will reorder.", orderRef: "ORD-7741", createdAt: "2026-05-20" },
  { id: "RV-2", supplierId: "SUP-001", buyerName: "Atlas Motors", rating: 5, comment: "Great communication and accurate compatibility info.", orderRef: "ORD-7702", createdAt: "2026-05-12" },
  { id: "RV-3", supplierId: "SUP-001", buyerName: "Sahara Trading", rating: 4, comment: "Good products, minor delay in shipping but well packed.", orderRef: "ORD-7688", createdAt: "2026-04-29" },
  { id: "RV-4", supplierId: "SUP-001", buyerName: "Gulf Auto LLC", rating: 5, comment: "Reliable partner, certificates provided without issues.", orderRef: "ORD-7650", createdAt: "2026-04-18" },
];

export const chatThreads: ChatThread[] = [
  {
    id: "TH-1",
    supplierId: "SUP-001",
    buyerName: "Yassine El Amrani",
    buyerCountry: "Morocco",
    lastPreview: "Can you confirm the lead time for 1200 units?",
    unread: 2,
    messages: [
      { id: "m1", threadId: "TH-1", from: "buyer", text: "Hello, interested in your brake pads for a bulk order.", at: "09:02" },
      { id: "m2", threadId: "TH-1", from: "supplier", text: "Hi Yassine, thanks for reaching out. Happy to help — what quantity?", at: "09:05" },
      { id: "m3", threadId: "TH-1", from: "buyer", text: "Around 1200 units monthly. Attaching our spec sheet.", attachments: [{ id: "a1", name: "spec_sheet.pdf", kind: "pdf" }], at: "09:10" },
      { id: "m4", threadId: "TH-1", from: "buyer", text: "Can you confirm the lead time for 1200 units?", at: "09:12" },
    ],
  },
  {
    id: "TH-2",
    supplierId: "SUP-001",
    buyerName: "Gulf Auto LLC",
    buyerCountry: "UAE",
    lastPreview: "Quotation received, reviewing internally.",
    unread: 0,
    messages: [
      { id: "m5", threadId: "TH-2", from: "supplier", text: "Quotation for coil springs attached.", quotationRef: "QT-3001", at: "Yesterday" },
      { id: "m6", threadId: "TH-2", from: "buyer", text: "Quotation received, reviewing internally.", at: "Yesterday" },
    ],
  },
  {
    id: "TH-3",
    supplierId: "SUP-001",
    buyerName: "Sahara Trading",
    buyerCountry: "Algeria",
    lastPreview: "Please send the CE certificate.",
    unread: 1,
    messages: [
      { id: "m7", threadId: "TH-3", from: "buyer", text: "Please send the CE certificate.", at: "08:40" },
    ],
  },
];

/* --- Foreign-tenant noise: must NEVER surface in SUP-001's dashboard --- */
export const foreignProducts: B2BProduct[] = [
  { id: "PR-9001", supplierId: "SUP-999", name: "Competitor Widget", category: "Others", description: "Belongs to another supplier.", images: 1, priceMin: 1, priceMax: 2, moq: 10, leadTimeDays: 5, status: "Live", createdAt: "2026-01-01" },
];

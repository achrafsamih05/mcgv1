/**
 * Shared Core data models for the MCG Global platform.
 * These cross-cutting types are consumed by every tenant system.
 */

/* ----------------------------- 1. RBAC ----------------------------- */

export type SystemRole =
  | "Buyer"
  | "Supplier"
  | "Driver"
  | "Warehouse Host"
  | "Super Admin";

export type Capability =
  // Buyer
  | "sourcing:query"
  | "rfq:execute"
  | "contract:monitor"
  | "tracking:view"
  // Supplier
  | "listing:curate"
  | "quote:dispatch"
  | "request:acquire"
  // Driver
  | "fleet:register"
  | "job:optimize"
  | "transit:update"
  // Warehouse
  | "storage:administer"
  | "reservation:map"
  | "rate:tune"
  // Super Admin
  | "tenant:override"
  | "platform:configure";

export interface SystemUserRole {
  role: SystemRole;
  description: string;
  capabilities: Capability[];
  crossTenant: boolean;
}

/* ----------------------- 2. Documents Center ----------------------- */

export type DocumentEntity = "Order" | "Deal" | "Shipment";

export type DocumentKind =
  | "Invoice"
  | "Packing List"
  | "Bill of Lading"
  | "Legal Contract";

export type DocumentFormat = "PDF" | "Image" | "DOCX";

export interface ManagedDocument {
  id: string;
  name: string;
  kind: DocumentKind;
  format: DocumentFormat;
  // Polymorphic link to a standard entity
  entityType: DocumentEntity;
  entityId: string;
  sizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
}

/* --------------------- 3. Escrow Deal Lifecycle -------------------- */

export type EscrowState =
  | "Open"
  | "In Negotiation"
  | "Agreed/Contracted"
  | "In Progress/Execution"
  | "Completed"
  | "Cancelled";

export const ESCROW_STATES: EscrowState[] = [
  "Open",
  "In Negotiation",
  "Agreed/Contracted",
  "In Progress/Execution",
  "Completed",
  "Cancelled",
];

export interface EscrowContract {
  id: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  grossValuation: number;
  state: EscrowState;
  documentIds: string[];
  createdAt: string;
}

/* ----------------------- 4. Dispute Resolution --------------------- */

export type DisputeAxis =
  | "Buyer vs Supplier"
  | "Buyer vs Driver"
  | "Buyer vs Warehouse";

export type DisputeStatus = "Filed" | "Under Review" | "Resolved";

export interface DisputeEvidence {
  id: string;
  label: string;
  kind: "photo" | "document";
}

export interface DisputeMessage {
  id: string;
  from: string;
  text: string;
  at: string;
}

export interface DisputeCase {
  id: string;
  axis: DisputeAxis;
  claimant: string;
  respondent: string;
  subject: string;
  claimText: string;
  amount: number;
  status: DisputeStatus;
  filedAt: string;
  evidence: DisputeEvidence[];
  chatTrail: DisputeMessage[];
  verdict?: string;
}

/* ------------------- 5. Supply Chain Master Timeline --------------- */

export type SupplyChainStage =
  | "Product Sourcing Request"
  | "Supplier Selection"
  | "Negotiation"
  | "Manufacturing/Production"
  | "Freight/Shipping"
  | "Warehousing/Storage"
  | "Last-Mile Transport"
  | "Final Delivery Receipt";

export const SUPPLY_CHAIN_STAGES: SupplyChainStage[] = [
  "Product Sourcing Request",
  "Supplier Selection",
  "Negotiation",
  "Manufacturing/Production",
  "Freight/Shipping",
  "Warehousing/Storage",
  "Last-Mile Transport",
  "Final Delivery Receipt",
];

export interface PipelineRecord {
  id: string;
  product: string;
  buyerName: string;
  supplierName: string;
  stage: SupplyChainStage;
  valuation: number;
  updatedAt: string;
}

/* ----------------------- 7. Audit Trail ---------------------------- */

export type AuditAction =
  | "Account Creation"
  | "Product Modification"
  | "Quote Admittance"
  | "Cargo Tracking Adjustment"
  | "Deal State Change"
  | "Document Upload";

export interface AuditTrailLog {
  id: string;
  userId: string;
  userMeta: string;
  action: AuditAction;
  delta: string;
  isoDate: string;
  systemTime: string;
}

/* ----------------------- 8. Support Tickets ------------------------ */

export type TicketCategory =
  | "Account"
  | "Payments"
  | "Logistics"
  | "Technical"
  | "Dispute";

export type TicketStatus = "Open" | "Routed" | "Awaiting Reply" | "Resolved";

export interface TicketReply {
  id: string;
  from: "user" | "staff";
  text: string;
  at: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  openedBy: string;
  assignedDivision?: string;
  createdAt: string;
  replies: TicketReply[];
}

/* ----------------------- 9. Notifications -------------------------- */

export type NotificationKind =
  | "Message"
  | "Quote"
  | "Transit Milestone"
  | "Reservation"
  | "Administrative";

export interface PlatformNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

/* ----------------------- 10. i18n / Currency ----------------------- */

export type LocaleCode = "en" | "ar" | "fr" | "zh";
export type CurrencyCode = "USD" | "EUR" | "MAD" | "CNY";

/* ----------------------- 11. Fraud Reports ------------------------- */

export type FraudCategory =
  | "Fake Supplier"
  | "Rogue Logistics Provider"
  | "Non-compliant Warehouse"
  | "Bot Reviews";

export interface FraudReport {
  id: string;
  targetEntity: string;
  category: FraudCategory;
  details: string;
  reportedAt: string;
}

/* ----------------------- 12. Federated Search ---------------------- */

export interface FederatedSearchResults {
  query: string;
  items: { id: string; name: string; category: string; price: string }[];
  corporations: { id: string; name: string; country: string }[];
  operations: { id: string; ref: string; stage: string }[];
  vehicles: { id: string; name: string; type: string; city: string }[];
}

/* ----------------------- 13. CEO BI -------------------------------- */

export interface ExecutiveKPIs {
  userAcquisitions: number;
  volumetricCommerceCap: number;
  totalOrders: number;
  closedDeals: number;
  profitMargin: number; // percent
}

export interface DemandHeatItem {
  label: string;
  weight: number; // 0..100
}

export type CoreSectionId =
  | "workspace"
  | "rbac"
  | "documents"
  | "escrow"
  | "disputes"
  | "audit"
  | "support"
  | "fraud"
  | "search"
  | "bi";

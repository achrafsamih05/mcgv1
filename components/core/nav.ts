import type { CoreSectionId } from "@/lib/core/types";

export type CoreNavItem = { id: CoreSectionId; label: string; icon: string };

export const coreNav: CoreNavItem[] = [
  { id: "workspace", label: "Ops Workspace", icon: "LayoutDashboard" },
  { id: "search", label: "Federated Search", icon: "Search" },
  { id: "escrow", label: "Escrow & Deals", icon: "Handshake" },
  { id: "documents", label: "Documents Center", icon: "FolderArchive" },
  { id: "disputes", label: "Mediation Hub", icon: "Scale" },
  { id: "support", label: "Support Tickets", icon: "LifeBuoy" },
  { id: "audit", label: "Audit Trail", icon: "ShieldCheck" },
  { id: "fraud", label: "Fraud Reports", icon: "Flag" },
  { id: "rbac", label: "RBAC Matrix", icon: "KeyRound" },
  { id: "bi", label: "CEO Intelligence", icon: "TrendingUp" },
];

export const coreSectionMeta: Record<CoreSectionId, { title: string; subtitle: string }> = {
  workspace: { title: "Unified Operations Workspace", subtitle: "The core supply-chain pipeline" },
  search: { title: "Federated Search", subtitle: "Cross-entity relational query" },
  escrow: { title: "Escrow & Deal Lifecycle", subtitle: "Contract finite-state machine" },
  documents: { title: "Documents Management Center", subtitle: "Cross-border compliance assets" },
  disputes: { title: "Mediation & Dispute Resolution", subtitle: "Tri-party arbitration" },
  support: { title: "Support Ticket Routing", subtitle: "User & staff desk" },
  audit: { title: "Immutable Audit Trail", subtitle: "Automated event capture" },
  fraud: { title: "Platform Integrity", subtitle: "Fraud reporting gate" },
  rbac: { title: "RBAC Guard Matrix", subtitle: "Role → capability mappings" },
  bi: { title: "CEO Business Intelligence", subtitle: "Executive strategic view" },
};

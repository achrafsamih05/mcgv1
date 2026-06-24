import type { Capability, SystemRole, SystemUserRole } from "./types";

/**
 * RBAC Guard Matrix — the canonical role→capability mapping for the platform.
 * Each tenant system's local rbac.ts enforces its own scope; this matrix is
 * the shared source of truth consumed by the core workspace and CEO tooling.
 */

export const ROLE_MATRIX: Record<SystemRole, SystemUserRole> = {
  Buyer: {
    role: "Buyer",
    description: "Importers sourcing products and executing RFQs.",
    capabilities: ["sourcing:query", "rfq:execute", "contract:monitor", "tracking:view"],
    crossTenant: false,
  },
  Supplier: {
    role: "Supplier",
    description: "Factories curating listings and dispatching quotes.",
    capabilities: ["listing:curate", "quote:dispatch", "request:acquire", "tracking:view"],
    crossTenant: false,
  },
  Driver: {
    role: "Driver",
    description: "Fleet operators managing jobs and transit updates.",
    capabilities: ["fleet:register", "job:optimize", "transit:update"],
    crossTenant: false,
  },
  "Warehouse Host": {
    role: "Warehouse Host",
    description: "Storage operators administering assets and rates.",
    capabilities: ["storage:administer", "reservation:map", "rate:tune"],
    crossTenant: false,
  },
  "Super Admin": {
    role: "Super Admin",
    description: "CEO / platform owner with absolute cross-tenant control.",
    capabilities: [
      "sourcing:query", "rfq:execute", "contract:monitor", "tracking:view",
      "listing:curate", "quote:dispatch", "request:acquire",
      "fleet:register", "job:optimize", "transit:update",
      "storage:administer", "reservation:map", "rate:tune",
      "tenant:override", "platform:configure",
    ],
    crossTenant: true,
  },
};

/** Authoritative capability check against the matrix. */
export function roleCan(role: SystemRole, capability: Capability): boolean {
  return ROLE_MATRIX[role].capabilities.includes(capability);
}

/** All capabilities, used for rendering the guard matrix grid. */
export const ALL_CAPABILITIES: Capability[] = [
  "sourcing:query", "rfq:execute", "contract:monitor", "tracking:view",
  "listing:curate", "quote:dispatch", "request:acquire",
  "fleet:register", "job:optimize", "transit:update",
  "storage:administer", "reservation:map", "rate:tune",
  "tenant:override", "platform:configure",
];

export const CAPABILITY_LABELS: Record<Capability, string> = {
  "sourcing:query": "Sourcing Queries",
  "rfq:execute": "RFQ Execution",
  "contract:monitor": "Contract Monitoring",
  "tracking:view": "Status Tracking",
  "listing:curate": "Listing Curation",
  "quote:dispatch": "Quote Dispatch",
  "request:acquire": "Request Acquisition",
  "fleet:register": "Fleet Registry",
  "job:optimize": "Job Optimization",
  "transit:update": "Transit Updates",
  "storage:administer": "Storage Admin",
  "reservation:map": "Reservation Mapping",
  "rate:tune": "Rate Tuning",
  "tenant:override": "Cross-Tenant Override",
  "platform:configure": "Platform Config",
};

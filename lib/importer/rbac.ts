/**
 * RBAC & user-bound data confinement for the Buyers & Importers System.
 *
 * An importer may only read/write resources whose `importerId` matches their
 * session — their own RFQs, quotations, contracts, shipments, bookings, and
 * communication pipelines.
 */

export interface ImporterSession {
  importerId: string;
  fullName: string;
  role: "importer_owner";
}

export type ImporterCapability =
  | "profile:update"
  | "rfq:manage"
  | "quotation:respond"
  | "tracking:view"
  | "logistics:book"
  | "feedback:submit"
  | "chat:participate";

const ALLOWED: ImporterCapability[] = [
  "profile:update",
  "rfq:manage",
  "quotation:respond",
  "tracking:view",
  "logistics:book",
  "feedback:submit",
  "chat:participate",
];

/** Actions an importer must never perform. */
export const PROHIBITED_ACTIONS = [
  "platform:config:modify",
  "supplier:internal-metrics:view",
  "commission:fees:alter",
  "tenant:cross:view-rfqs",
] as const;

export function can(
  session: ImporterSession | null,
  capability: ImporterCapability
): boolean {
  if (!session) return false;
  return ALLOWED.includes(capability);
}

/** The single choke-point that confines data to the owning importer. */
export function scopeToUser<T extends { importerId: string }>(
  session: ImporterSession | null,
  records: T[]
): T[] {
  if (!session) return [];
  return records.filter((r) => r.importerId === session.importerId);
}

export function ownsResource(
  session: ImporterSession | null,
  resource: { importerId: string } | null | undefined
): boolean {
  if (!session || !resource) return false;
  return resource.importerId === session.importerId;
}

export class UserAccessError extends Error {
  constructor(resourceId: string) {
    super(`Access denied: resource ${resourceId} is outside your account scope.`);
    this.name = "UserAccessError";
  }
}

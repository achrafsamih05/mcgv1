/**
 * Role-Based Access Control & multi-tenant guardrails for the Suppliers System.
 *
 * The golden rule: a supplier may only ever touch resources whose `supplierId`
 * matches their own session tenant. These helpers centralize that check so it
 * cannot be bypassed at the component level. In production these run on the
 * server (route handlers / server actions); here they also guard client state.
 */

export interface SupplierSession {
  supplierId: string;
  companyName: string;
  role: "supplier_owner" | "supplier_staff";
}

export type SupplierCapability =
  | "profile:update"
  | "catalog:create"
  | "catalog:delete"
  | "request:view"
  | "quotation:emit"
  | "chat:participate";

/** Capabilities a supplier IS allowed to perform (scoped to own tenant). */
const ALLOWED: SupplierCapability[] = [
  "profile:update",
  "catalog:create",
  "catalog:delete",
  "request:view",
  "quotation:emit",
  "chat:participate",
];

/**
 * Capabilities explicitly PROHIBITED for suppliers. Listed for documentation
 * and so any accidental call fails loudly rather than silently succeeding.
 */
export const PROHIBITED_ACTIONS = [
  "platform:config:modify",
  "metrics:competitor:view",
  "commission:fees:alter",
  "tenant:cross:list-users",
] as const;

export function can(
  session: SupplierSession | null,
  capability: SupplierCapability
): boolean {
  if (!session) return false;
  return ALLOWED.includes(capability);
}

/**
 * Tenant ownership guard. Returns true only when the resource belongs to the
 * current supplier session. Use before reading or mutating ANY tenant resource.
 */
export function ownsResource(
  session: SupplierSession | null,
  resource: { supplierId: string } | null | undefined
): boolean {
  if (!session || !resource) return false;
  return resource.supplierId === session.supplierId;
}

/**
 * Filters any tenant-scoped collection down to the current supplier's records.
 * This is the single choke-point that prevents cross-tenant data leakage.
 */
export function scopeToTenant<T extends { supplierId: string }>(
  session: SupplierSession | null,
  records: T[]
): T[] {
  if (!session) return [];
  return records.filter((r) => r.supplierId === session.supplierId);
}

/** Thrown (and surfaced) when a tenant boundary would be crossed. */
export class TenantAccessError extends Error {
  constructor(resourceId: string) {
    super(`Access denied: resource ${resourceId} is outside your tenant scope.`);
    this.name = "TenantAccessError";
  }
}

export function assertOwnership(
  session: SupplierSession | null,
  resource: { id: string; supplierId: string }
): void {
  if (!ownsResource(session, resource)) {
    throw new TenantAccessError(resource.id);
  }
}

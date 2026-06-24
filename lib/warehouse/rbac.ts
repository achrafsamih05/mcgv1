/**
 * RBAC & multi-tenant guardrails for the Warehouses System.
 *
 * A warehouse operator may only access resources whose `operatorId` matches
 * their session tenant — never competitor listings, rates, revenue, or client
 * requests.
 */

export interface OperatorSession {
  operatorId: string;
  displayName: string;
  kind: "Individual Owner" | "Storage Company";
  role: "operator_owner" | "operator_staff";
}

export type OperatorCapability =
  | "profile:update"
  | "facility:manage"
  | "booking:view"
  | "quotation:emit"
  | "chat:participate";

const ALLOWED: OperatorCapability[] = [
  "profile:update",
  "facility:manage",
  "booking:view",
  "quotation:emit",
  "chat:participate",
];

/** Actions a warehouse operator must never perform. */
export const PROHIBITED_ACTIONS = [
  "platform:config:modify",
  "metrics:competitor:view",
  "commission:fees:alter",
  "tenant:cross:view-listings",
] as const;

export function can(
  session: OperatorSession | null,
  capability: OperatorCapability
): boolean {
  if (!session) return false;
  return ALLOWED.includes(capability);
}

/** The single choke-point that prevents cross-tenant data leakage. */
export function scopeToTenant<T extends { operatorId: string }>(
  session: OperatorSession | null,
  records: T[]
): T[] {
  if (!session) return [];
  return records.filter((r) => r.operatorId === session.operatorId);
}

export function ownsResource(
  session: OperatorSession | null,
  resource: { operatorId: string } | null | undefined
): boolean {
  if (!session || !resource) return false;
  return resource.operatorId === session.operatorId;
}

export class TenantAccessError extends Error {
  constructor(resourceId: string) {
    super(`Access denied: resource ${resourceId} is outside your tenant scope.`);
    this.name = "TenantAccessError";
  }
}

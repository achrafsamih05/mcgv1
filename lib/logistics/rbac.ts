/**
 * RBAC & multi-tenant guardrails for the Drivers & Transportation System.
 *
 * A logistics provider (independent driver or transport company) may only
 * ever access resources whose `providerId` matches their session tenant —
 * their own fleet, allocated orders, trips and direct client chats.
 */

export interface ProviderSession {
  providerId: string;
  displayName: string;
  kind: "Independent Driver" | "Transport Company";
  role: "provider_owner" | "provider_staff";
}

export type ProviderCapability =
  | "profile:update"
  | "fleet:manage"
  | "job:view"
  | "quotation:emit"
  | "trip:update"
  | "chat:participate";

const ALLOWED: ProviderCapability[] = [
  "profile:update",
  "fleet:manage",
  "job:view",
  "quotation:emit",
  "trip:update",
  "chat:participate",
];

/** Actions a logistics provider must never perform. */
export const PROHIBITED_ACTIONS = [
  "platform:config:modify",
  "metrics:competitor:view",
  "commission:fees:alter",
  "tenant:cross:view-orders",
] as const;

export function can(
  session: ProviderSession | null,
  capability: ProviderCapability
): boolean {
  if (!session) return false;
  return ALLOWED.includes(capability);
}

/** The single choke-point that prevents cross-tenant data leakage. */
export function scopeToTenant<T extends { providerId: string }>(
  session: ProviderSession | null,
  records: T[]
): T[] {
  if (!session) return [];
  return records.filter((r) => r.providerId === session.providerId);
}

export function ownsResource(
  session: ProviderSession | null,
  resource: { providerId: string } | null | undefined
): boolean {
  if (!session || !resource) return false;
  return resource.providerId === session.providerId;
}

export class TenantAccessError extends Error {
  constructor(resourceId: string) {
    super(`Access denied: resource ${resourceId} is outside your tenant scope.`);
    this.name = "TenantAccessError";
  }
}

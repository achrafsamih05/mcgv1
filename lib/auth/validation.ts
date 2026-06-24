import type { FieldKey, FieldSpec, UserRole } from "./roles";

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type PasswordStrength = "weak" | "medium" | "strong";

export function passwordStrength(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score >= 4) return "strong";
  if (score >= 2) return "medium";
  return "weak";
}

/** Validate a single field value, returning an Arabic error or null. */
export function validateField(key: FieldKey, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "هذا الحقل مطلوب";
  if (key === "email" && !EMAIL_RE.test(trimmed)) return "صيغة البريد الإلكتروني غير صحيحة";
  if (key === "password") {
    if (trimmed.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (passwordStrength(trimmed) === "weak") return "كلمة المرور ضعيفة جداً";
  }
  return null;
}

export type FieldErrors = Partial<Record<FieldKey, string>>;

/** Validate an entire field set for the active role. */
export function validateFields(
  fields: FieldSpec[],
  values: Partial<Record<FieldKey, string>>
): FieldErrors {
  const errors: FieldErrors = {};
  for (const f of fields) {
    const err = validateField(f.key, values[f.key] ?? "");
    if (err) errors[f.key] = err;
  }
  return errors;
}

/** Demo-only: infer a role from the sign-in email for redirect simulation. */
export function inferRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase();
  if (e.includes("admin") || e.includes("ceo")) return "SUPER_ADMIN";
  if (e.includes("supplier") || e.includes("factory")) return "SUPPLIER";
  if (e.includes("driver") || e.includes("fleet") || e.includes("carrier")) return "DRIVER";
  if (e.includes("warehouse") || e.includes("storage")) return "WAREHOUSE_HOST";
  return "BUYER";
}

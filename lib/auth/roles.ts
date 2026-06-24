/**
 * Auth role configuration. Maps the 4 sign-up identities to their required
 * fields, and the full UserRole set to post-auth dashboard redirects.
 */

export type UserRole =
  | "BUYER"
  | "SUPPLIER"
  | "DRIVER"
  | "WAREHOUSE_HOST"
  | "SUPER_ADMIN";

/** Role-specific field keys used to drive dynamic validation. */
export type FieldKey =
  | "fullName"
  | "email"
  | "corporatePhone"
  | "password"
  | "contactPerson"
  | "companyLegalName"
  | "factoryLocation"
  | "driverName"
  | "fleetType"
  | "licenseNumber"
  | "facilityOwnerName"
  | "storageCity"
  | "facilityType";

export interface FieldSpec {
  key: FieldKey;
  labelAr: string;
  labelEn: string;
  type: "text" | "email" | "tel" | "password";
}

export interface SignupRoleConfig {
  /** The four selectable sign-up identities. */
  role: Exclude<UserRole, "SUPER_ADMIN">;
  icon: string;
  titleAr: string;
  titleEn: string;
  fields: FieldSpec[];
}

const PASSWORD_FIELD: FieldSpec = {
  key: "password",
  labelAr: "كلمة المرور",
  labelEn: "Password",
  type: "password",
};

export const SIGNUP_ROLES: SignupRoleConfig[] = [
  {
    role: "BUYER",
    icon: "🏢",
    titleAr: "مستورد",
    titleEn: "Importer",
    fields: [
      { key: "fullName", labelAr: "الاسم الكامل", labelEn: "Full Name", type: "text" },
      { key: "email", labelAr: "البريد الإلكتروني", labelEn: "Email", type: "email" },
      { key: "corporatePhone", labelAr: "هاتف الشركة", labelEn: "Corporate Phone", type: "tel" },
      PASSWORD_FIELD,
    ],
  },
  {
    role: "SUPPLIER",
    icon: "🏭",
    titleAr: "مورّد",
    titleEn: "Supplier",
    fields: [
      { key: "contactPerson", labelAr: "الشخص المسؤول", labelEn: "Contact Person", type: "text" },
      { key: "companyLegalName", labelAr: "الاسم القانوني للشركة", labelEn: "Company Legal Name", type: "text" },
      { key: "factoryLocation", labelAr: "موقع المصنع", labelEn: "Factory Location", type: "text" },
      PASSWORD_FIELD,
    ],
  },
  {
    role: "DRIVER",
    icon: "🚛",
    titleAr: "سائق أو شركة نقل",
    titleEn: "Carrier",
    fields: [
      { key: "driverName", labelAr: "اسم السائق", labelEn: "Driver Name", type: "text" },
      { key: "fleetType", labelAr: "نوع أسطول المركبات", labelEn: "Vehicle Fleet Type", type: "text" },
      { key: "licenseNumber", labelAr: "رقم الرخصة", labelEn: "License Number", type: "text" },
      PASSWORD_FIELD,
    ],
  },
  {
    role: "WAREHOUSE_HOST",
    icon: "📦",
    titleAr: "صاحب مستودع",
    titleEn: "Warehouse Host",
    fields: [
      { key: "facilityOwnerName", labelAr: "اسم مالك المنشأة", labelEn: "Facility Owner Name", type: "text" },
      { key: "storageCity", labelAr: "مدينة التخزين", labelEn: "Storage City", type: "text" },
      { key: "facilityType", labelAr: "نوع المنشأة", labelEn: "Facility Type", type: "text" },
      PASSWORD_FIELD,
    ],
  },
];

/** Post-authentication redirect target per role (matches real App Router segments). */
export const ROLE_REDIRECT: Record<UserRole, string> = {
  BUYER: "/importer",
  SUPPLIER: "/supplier",
  DRIVER: "/logistics",
  WAREHOUSE_HOST: "/warehouse",
  SUPER_ADMIN: "/admin",
};

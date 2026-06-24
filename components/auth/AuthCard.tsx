"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Ship } from "lucide-react";
import {
  ROLE_REDIRECT,
  SIGNUP_ROLES,
  type FieldKey,
  type FieldSpec,
  type SignupRoleConfig,
} from "@/lib/auth/roles";
import {
  inferRoleFromEmail,
  passwordStrength,
  validateField,
  validateFields,
  type FieldErrors,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";
import type { FieldKey as RoleFieldKey } from "@/lib/auth/roles";

type Tab = "signin" | "signup";

/** True when public Supabase env vars are present at build/runtime. */
const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Pick the best "full name" field available for the chosen role. */
function resolveFullName(values: Partial<Record<RoleFieldKey, string>>): string {
  return (
    values.fullName ||
    values.contactPerson ||
    values.driverName ||
    values.facilityOwnerName ||
    ""
  );
}

export function AuthCard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <div dir="rtl" className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-white">
            <Ship className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-white">
            MCG <span className="text-accent-500">Global</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-extrabold leading-snug text-white">
            منصّتك المتكاملة للتجارة واللوجستيك
          </h1>
          <p className="mt-3 text-base leading-relaxed text-navy-200">
            نربط المستوردين في المغرب بالموردين والمصانع في الصين، مع حلول النقل
            والتخزين في منظومة واحدة موثوقة.
          </p>
          <p className="mt-2 text-sm text-navy-400" dir="ltr">
            Connecting China to Morocco — B2B trade &amp; logistics, unified.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { ar: "موردون موثّقون", en: "Verified suppliers" },
              { ar: "تتبّع الشحنات لحظياً", en: "Real-time shipment tracking" },
              { ar: "دفع آمن عبر الضمان", en: "Secure escrow payments" },
            ].map((item) => (
              <li key={item.en} className="flex items-center gap-3 text-sm text-navy-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500/20 text-accent-400">
                  ✓
                </span>
                <span>{item.ar}</span>
                <span className="text-navy-500" dir="ltr">· {item.en}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-navy-500">
          © {new Date().getFullYear()} MCG Global. جميع الحقوق محفوظة.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-[#0F172A] px-4 py-10 sm:px-6 lg:bg-surface lg:py-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
              <Ship className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">
              MCG <span className="text-accent-500">Global</span>
            </span>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-xl sm:p-8">
            {/* Tabs */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-navy-50 p-1">
              <TabButton active={tab === "signin"} onClick={() => setTab("signin")} ar="تسجيل الدخول" en="Sign In" />
              <TabButton active={tab === "signup"} onClick={() => setTab("signup")} ar="إنشاء حساب" en="Sign Up" />
            </div>

            {tab === "signin" ? (
              <SignInForm
                onAuthenticated={(role) => router.push(ROLE_REDIRECT[role])}
              />
            ) : (
              <SignUpForm
                onAuthenticated={(role) => router.push(ROLE_REDIRECT[role])}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Tab button ----------------------------- */

function TabButton({
  active,
  onClick,
  ar,
  en,
}: {
  active: boolean;
  onClick: () => void;
  ar: string;
  en: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
        active ? "bg-accent-500 text-white shadow-sm" : "text-navy-600 hover:bg-white"
      }`}
    >
      {ar}
      <span className="ms-1.5 text-[11px] font-normal opacity-70" dir="ltr">{en}</span>
    </button>
  );
}

/* ----------------------------- Inputs --------------------------------- */

function TextField({
  spec,
  value,
  error,
  onChange,
}: {
  spec: FieldSpec;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = spec.type === "password";
  const strength = isPassword && value ? passwordStrength(value) : null;

  return (
    <div>
      <label htmlFor={spec.key} className="mb-1.5 block text-sm font-medium text-navy-800">
        {spec.labelAr}
        <span className="ms-1.5 text-[11px] font-normal text-navy-400" dir="ltr">{spec.labelEn}</span>
      </label>
      <div className="relative">
        <input
          id={spec.key}
          type={isPassword && show ? "text" : spec.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={spec.type === "email" || spec.type === "tel" ? "ltr" : "rtl"}
          aria-invalid={!!error}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition-colors duration-200 placeholder:text-navy-300 focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
              : "border-navy-200 focus:border-accent-500 focus:ring-accent-100"
          } ${isPassword ? "pe-10" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute inset-y-0 end-2 flex cursor-pointer items-center text-navy-400 hover:text-navy-700"
          >
            {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* Password strength meter */}
      {isPassword && value && (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2].map((i) => {
              const lit =
                (strength === "weak" && i === 0) ||
                (strength === "medium" && i <= 1) ||
                strength === "strong";
              const color =
                strength === "strong" ? "bg-emerald-500" : strength === "medium" ? "bg-amber-500" : "bg-red-500";
              return <span key={i} className={`h-1.5 flex-1 rounded-full ${lit ? color : "bg-navy-100"}`} />;
            })}
          </div>
          <span className="text-[11px] font-medium text-navy-500">
            {strength === "strong" ? "قوية" : strength === "medium" ? "متوسطة" : "ضعيفة"}
          </span>
        </div>
      )}

      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ----------------------------- Sign In -------------------------------- */

function SignInForm({ onAuthenticated }: { onAuthenticated: (role: ReturnType<typeof inferRoleFromEmail>) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    const emailErr = validateField("email", email);
    if (emailErr) next.email = emailErr;
    if (!password.trim()) next.password = "هذا الحقل مطلوب";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setAuthError(null);

    // Production path: authenticate against Supabase, then read the role from
    // the profiles table to drive the redirect.
    if (SUPABASE_CONFIGURED) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          setAuthError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
          setLoading(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        onAuthenticated((profile?.role as ReturnType<typeof inferRoleFromEmail>) ?? "BUYER");
        return;
      } catch {
        setAuthError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
        setLoading(false);
        return;
      }
    }

    // Demo fallback (no backend configured): infer role from the email.
    const role = inferRoleFromEmail(email);
    setTimeout(() => onAuthenticated(role), 700);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <TextField
        spec={{ key: "email", labelAr: "البريد الإلكتروني", labelEn: "Email", type: "email" }}
        value={email}
        error={errors.email}
        onChange={setEmail}
      />
      <TextField
        spec={{ key: "password", labelAr: "كلمة المرور", labelEn: "Password", type: "password" }}
        value={password}
        error={errors.password}
        onChange={setPassword}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-navy-600">
          <input type="checkbox" className="h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
          تذكّرني
        </label>
        <button type="button" className="cursor-pointer font-medium text-accent-600 hover:underline">
          نسيت كلمة المرور؟
        </button>
      </div>

      {authError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{authError}</p>
      )}

      <SubmitButton loading={loading} ar="تسجيل الدخول" en="Sign In" />
      <p className="text-center text-[11px] text-navy-400">
        تلميح: استخدم بريداً يحتوي على admin / supplier / driver / warehouse لتجربة التوجيه.
      </p>
    </form>
  );
}

/* ----------------------------- Sign Up -------------------------------- */

function SignUpForm({ onAuthenticated }: { onAuthenticated: (role: SignupRoleConfig["role"]) => void }) {
  const [selected, setSelected] = useState<SignupRoleConfig>(SIGNUP_ROLES[0]);
  const [values, setValues] = useState<Partial<Record<FieldKey, string>>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Reset values when switching role so stale fields don't leak across roles.
  const selectRole = (cfg: SignupRoleConfig) => {
    setSelected(cfg);
    setValues({});
    setErrors({});
  };

  const setValue = (key: FieldKey, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const activeFields = useMemo(() => selected.fields, [selected]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateFields(activeFields, values);
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setAuthError(null);

    const password = values.password ?? "";
    // Email is only collected directly for the Importer role; others sign up
    // with a generated handle until they add a contact email in onboarding.
    const email = values.email ?? `${selected.role.toLowerCase()}-${Date.now()}@mcg-global.app`;

    if (SUPABASE_CONFIGURED) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // The DB trigger reads role + full_name from this metadata.
            data: { role: selected.role, full_name: resolveFullName(values) },
          },
        });
        if (error) {
          setAuthError("تعذّر إنشاء الحساب: " + error.message);
          setLoading(false);
          return;
        }
        onAuthenticated(selected.role);
        return;
      } catch {
        setAuthError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
        setLoading(false);
        return;
      }
    }

    // Demo fallback (no backend configured).
    setTimeout(() => onAuthenticated(selected.role), 700);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {/* Role selector grid */}
      <div>
        <p className="mb-2 text-sm font-medium text-navy-800">
          اختر نوع الحساب
          <span className="ms-1.5 text-[11px] font-normal text-navy-400" dir="ltr">Account type</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SIGNUP_ROLES.map((cfg) => {
            const active = selected.role === cfg.role;
            return (
              <button
                key={cfg.role}
                type="button"
                onClick={() => selectRole(cfg)}
                aria-pressed={active}
                className={`flex cursor-pointer flex-col items-start gap-1 rounded-xl border-2 p-3 text-right transition-colors duration-200 ${
                  active ? "border-accent-500 bg-accent-50" : "border-navy-200 hover:bg-navy-50"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">{cfg.icon}</span>
                <span className="text-sm font-semibold text-navy-900">{cfg.titleAr}</span>
                <span className="text-[11px] text-navy-400" dir="ltr">{cfg.titleEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic role-specific fields */}
      <div className="space-y-4">
        {activeFields.map((spec) => (
          <TextField
            key={spec.key}
            spec={spec}
            value={values[spec.key] ?? ""}
            error={errors[spec.key]}
            onChange={(v) => setValue(spec.key, v)}
          />
        ))}
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-navy-600">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 cursor-pointer rounded border-navy-300 text-accent-500 focus:ring-accent-400" />
        <span>أوافق على شروط الخدمة وسياسة الخصوصية الخاصة بمنصّة MCG Global.</span>
      </label>

      {authError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{authError}</p>
      )}

      <SubmitButton loading={loading} ar="إنشاء حساب جديد" en="Create Account" />
    </form>
  );
}

/* --------------------------- Submit button ---------------------------- */

function SubmitButton({ loading, ar, en }: { loading: boolean; ar: string; en: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          جارٍ المعالجة…
        </>
      ) : (
        <>
          {ar}
          <span className="text-xs opacity-80" dir="ltr">{en}</span>
        </>
      )}
    </button>
  );
}

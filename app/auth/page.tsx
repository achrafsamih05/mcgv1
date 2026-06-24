import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "تسجيل الدخول | MCG Global",
  description: "سجّل الدخول أو أنشئ حساباً جديداً على منصّة MCG Global للتجارة واللوجستيك.",
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return <AuthCard />;
}

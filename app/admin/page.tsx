import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Command Center",
  description: "MCG Global Super Admin — Central Command Center",
  robots: { index: false, follow: false }, // admin area is not indexed
};

export default function AdminPage() {
  return <AdminShell />;
}

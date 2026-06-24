import type { Metadata } from "next";
import { RegistrationWizard } from "@/components/supplier/RegistrationWizard";

export const metadata: Metadata = {
  title: "Become a Supplier",
  description: "Register your factory or trading company on MCG Global.",
};

export default function SupplierRegisterPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-10 sm:px-6">
      <RegistrationWizard />
    </main>
  );
}

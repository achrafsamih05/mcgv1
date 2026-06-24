import type { Metadata } from "next";
import { RegistrationWizard } from "@/components/logistics/RegistrationWizard";

export const metadata: Metadata = {
  title: "Become a Transport Provider",
  description: "Register as an independent driver or transport company on MCG Global.",
};

export default function LogisticsRegisterPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-10 sm:px-6">
      <RegistrationWizard />
    </main>
  );
}

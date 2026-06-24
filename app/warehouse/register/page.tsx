import type { Metadata } from "next";
import { RegistrationWizard } from "@/components/warehouse/RegistrationWizard";

export const metadata: Metadata = {
  title: "List Your Warehouse",
  description: "Register as an individual owner or storage company on MCG Global.",
};

export default function WarehouseRegisterPage() {
  return (
    <main className="min-h-screen bg-navy-50/40 px-4 py-10 sm:px-6">
      <RegistrationWizard />
    </main>
  );
}

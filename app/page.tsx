import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SmartSearch } from "@/components/SmartSearch";
import { Categories } from "@/components/Categories";
import { Suppliers } from "@/components/Suppliers";
import { Transport } from "@/components/Transport";
import { Warehouses } from "@/components/Warehouses";
import { HowItWorks } from "@/components/HowItWorks";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero + 2. Smart Search (search overlaps hero bottom) */}
        <Hero />
        <SmartSearch />

        {/* 3. Popular Categories */}
        <Categories />

        {/* 4. Featured Suppliers */}
        <Suppliers />

        {/* 5. Transport & Delivery */}
        <Transport />

        {/* 6. Warehouse Solutions */}
        <Warehouses />

        {/* 7. How It Works */}
        <HowItWorks />

        {/* 8. Live Platform Metrics */}
        <Stats />

        {/* 9. Testimonials */}
        <Testimonials />

        {/* 10. Contact & Support */}
        <Contact />
      </main>

      {/* 11. Footer */}
      <Footer />

      <FloatingWhatsApp />
    </>
  );
}

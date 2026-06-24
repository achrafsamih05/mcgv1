"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { content, whatsappLink } from "@/lib/content";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useSession } from "@/lib/auth/useSession";

export function Hero() {
  const t = content.en.hero;
  const session = useSession();

  // Request Product:
  //  - authenticated BUYER → straight to the new-RFQ action
  //  - any other authenticated role → their dashboard
  //  - unauthenticated → auth portal with a return-to param
  const requestProductHref = session.isAuthenticated
    ? session.role === "BUYER"
      ? "/dashboard/buyer?action=new-rfq"
      : session.dashboardPath ?? "/auth"
    : "/auth?redirectedFrom=/dashboard/buyer?action=new-rfq";

  return (
    <section id="home" className="relative isolate overflow-hidden">
      {/* Background image (global port). Marked priority as the LCP element. */}
      <Image
        src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1920&q=70"
        alt="Aerial view of a global shipping port with stacked containers"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Dark transparent overlay for text contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/75 to-navy-900/90"
      />

      <div className="container-page relative flex min-h-[88vh] flex-col justify-center pb-16 pt-36 sm:pt-44">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-accent-300 backdrop-blur-sm"
        >
          {t.eyebrow}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl"
        >
          {t.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-100"
        >
          {t.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <a
            href={requestProductHref}
            className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-900/20 transition-colors duration-200 hover:bg-accent-600"
          >
            {t.requestProduct}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a
            href="#suppliers"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {t.findSupplier}
          </a>
          <a
            href={whatsappLink("Hello MCG Global, I'd like to import a product.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-colors duration-200 hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t.whatsapp}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

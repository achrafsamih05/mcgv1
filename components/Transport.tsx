"use client";

import { Bike, Car, Truck, Package, type LucideIcon } from "lucide-react";
import { content } from "@/lib/content";
import { fleet, type FleetOption } from "@/lib/data";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// Lucide has no dedicated "van" glyph; Package communicates medium delivery.
const iconMap: Record<FleetOption["icon"], LucideIcon> = {
  truck: Truck,
  van: Package,
  car: Car,
  bike: Bike,
};

export function Transport() {
  const t = content.en.transport;

  return (
    <Section id="transport" className="bg-navy-950">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-200 sm:text-lg">
            {t.description}
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {fleet.map((f, i) => {
          const Icon = iconMap[f.icon];
          return (
            <Reveal key={f.id} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:border-accent-400/40 hover:bg-white/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400 transition-colors duration-200 group-hover:bg-accent-500 group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {f.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">
                  {f.description}
                </p>
                <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent-200">
                  {f.capacity}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

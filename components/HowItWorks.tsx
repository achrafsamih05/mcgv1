"use client";

import {
  Boxes,
  Handshake,
  Radar,
  Search,
  type LucideIcon,
} from "lucide-react";
import { content } from "@/lib/content";
import { steps, type Step } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const iconMap: Record<Step["icon"], LucideIcon> = {
  search: Search,
  handshake: Handshake,
  boxes: Boxes,
  radar: Radar,
};

export function HowItWorks() {
  const t = content.en.how;

  return (
    <Section id="how" className="bg-white">
      <Reveal>
        <SectionHeader title={t.title} description={t.description} />
      </Reveal>

      <div className="relative mt-14">
        {/* Connecting line (desktop) */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent lg:block"
        />

        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, i) => {
            const Icon = iconMap[step.icon];
            return (
              <Reveal key={step.id} delay={i * 0.08}>
                <li className="relative flex flex-col items-center text-center">
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-card">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white ring-4 ring-white">
                      {step.id}
                    </span>
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-navy-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-navy-600">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

"use client";

import {
  Armchair,
  Car,
  Factory,
  Laptop,
  Shirt,
  Tractor,
  type LucideIcon,
  ArrowRight,
} from "lucide-react";
import { content } from "@/lib/content";
import { categories, type Category } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const iconMap: Record<Category["icon"], LucideIcon> = {
  car: Car,
  tractor: Tractor,
  factory: Factory,
  shirt: Shirt,
  armchair: Armchair,
  laptop: Laptop,
};

export function Categories() {
  const t = content.en.categories;

  return (
    <Section id="categories">
      <Reveal>
        <SectionHeader title={t.title} description={t.description} />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon];
          return (
            <Reveal key={cat.id} delay={i * 0.05}>
              <a
                href={cat.href}
                className="group flex h-full cursor-pointer flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition-colors duration-200 group-hover:bg-accent-500 group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy-900">
                  {cat.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">
                  {cat.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600">
                  {cat.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

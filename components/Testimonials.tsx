"use client";

import { Quote } from "lucide-react";
import { content } from "@/lib/content";
import { testimonials } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";

export function Testimonials() {
  const t = content.en.testimonials;

  return (
    <Section id="testimonials">
      <Reveal>
        <SectionHeader title={t.title} description={t.description} />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.07}>
            <figure className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
              <Quote
                className="h-8 w-8 text-accent-200"
                aria-hidden="true"
              />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy-700">
                “{item.quote}”
              </blockquote>
              <Stars rating={item.rating} />
              <figcaption className="mt-4 flex items-center gap-3 border-t border-navy-100 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {item.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy-900">
                    {item.name}
                  </span>
                  <span className="block text-xs text-navy-500">
                    {item.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

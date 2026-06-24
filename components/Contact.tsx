"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { content, SUPPORT_EMAIL, whatsappLink } from "@/lib/content";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";

export function Contact() {
  const t = content.en.contact;
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: POST to /api/contact when backend is ready.
    setSent(true);
  };

  return (
    <Section id="contact" className="bg-white">
      <Reveal>
        <SectionHeader title={t.title} description={t.description} />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick access cards */}
        <Reveal className="flex flex-col gap-4">
          <a
            href={whatsappLink("Hello MCG Global, I need assistance.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-whatsapp/40 hover:shadow-card-hover"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-whatsapp/10 text-whatsapp transition-colors duration-200 group-hover:bg-whatsapp group-hover:text-white">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-semibold text-navy-900">
                {t.whatsappTitle}
              </span>
              <span className="mt-1 block text-sm text-navy-600">
                {t.whatsappDesc}
              </span>
            </span>
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:shadow-card-hover"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors duration-200 group-hover:bg-accent-500 group-hover:text-white">
              <Mail className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-navy-900">
                {t.emailTitle}
              </span>
              <span className="mt-1 block text-sm text-navy-600">
                {SUPPORT_EMAIL}
              </span>
            </span>
          </a>
        </Reveal>

        {/* Contact form */}
        <Reveal delay={0.1}>
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-navy-100 bg-navy-50/60 p-6 shadow-card"
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-navy-800"
                >
                  {t.formName}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-200 focus:border-accent-400"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-navy-800"
                >
                  {t.formEmail}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-200 focus:border-accent-400"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-navy-800"
                >
                  {t.formMessage}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full resize-y rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-200 focus:border-accent-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-600"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {t.formSubmit}
              </button>
              {sent && (
                <p
                  role="status"
                  className="text-sm font-medium text-emerald-600"
                >
                  Thanks — we&apos;ll get back to you within one business hour.
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}

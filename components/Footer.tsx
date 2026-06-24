import { Ship } from "lucide-react";
import { content } from "@/lib/content";

export function Footer() {
  const t = content.en.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
                <Ship className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-white">
                MCG <span className="text-accent-500">Global</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">
              {t.tagline}
            </p>
          </div>

          {/* Link columns */}
          {t.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-navy-300 transition-colors duration-200 hover:text-accent-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-navy-400 sm:flex-row">
          <p>
            &copy; {year} MCG Global. {t.rights}
          </p>
          <p>Built for global trade.</p>
        </div>
      </div>
    </footer>
  );
}

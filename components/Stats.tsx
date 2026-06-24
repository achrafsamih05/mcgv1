"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { stats, type Stat } from "@/lib/data";
import { content } from "@/lib/content";

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, stat.value]);

  return (
    <span ref={ref} aria-label={`${stat.value}${stat.suffix} ${stat.label}`}>
      {value}
      {stat.suffix}
    </span>
  );
}

export function Stats() {
  const t = content.en.stats;

  return (
    <section className="bg-navy-900 py-16 sm:py-20">
      <div className="container-page">
        <h2 className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-accent-400">
          {t.title}
        </h2>
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <dd className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <Counter stat={stat} />
              </dd>
              <dt className="mt-2 text-sm font-medium text-navy-200">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

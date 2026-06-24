"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Lightweight scroll-reveal wrapper using Framer Motion.
 * Respects prefers-reduced-motion automatically (motion library honors it
 * via the reduced-motion media query in globals.css for transitions, and we
 * keep transforms subtle).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

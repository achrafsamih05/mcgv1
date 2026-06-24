import { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  align?: "center" | "left";
};

/** Consistent section heading block used across the page. */
export function SectionHeader({
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl text-balance">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

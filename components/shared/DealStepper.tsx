"use client";

/**
 * Req 13 — Deal Timeline Stepper.
 *
 * Renders exactly one active stage mapped 1:1 to a Deal's `deal_status`.
 * Completed + active stages use the Brand_Accent (#F97316); pending stages use
 * a muted treatment. When the bound status changes (via realtime), the active
 * stage advances automatically. An unmapped/absent status falls back to OPEN.
 */
import { Check } from "lucide-react";
import { DEAL_STAGES, type DealStage, type DealStatus } from "@/lib/supabase/database.types";

const STAGE_LABEL: Record<DealStage, string> = {
  OPEN: "Open",
  NEGOTIATION: "Negotiation",
  CONTRACTED: "Contracted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export function DealStepper({ status }: { status: DealStatus }) {
  // CANCELLED or any unmapped value falls back to the initial OPEN stage.
  const activeIndex = Math.max(0, DEAL_STAGES.indexOf(status as DealStage));
  const cancelled = status === "CANCELLED";

  return (
    <div>
      <ol className="flex items-center">
        {DEAL_STAGES.map((stage, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          const lit = done || active;
          return (
            <li key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                    lit ? "bg-accent-500 text-white" : "bg-navy-700/40 text-navy-300"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className={`whitespace-nowrap text-[11px] font-medium ${lit ? "text-accent-400" : "text-navy-400"}`}>
                  {STAGE_LABEL[stage]}
                </span>
              </div>
              {i < DEAL_STAGES.length - 1 && (
                <span className={`mx-2 h-0.5 flex-1 transition-colors duration-300 ${i < activeIndex ? "bg-accent-500" : "bg-navy-700/40"}`} />
              )}
            </li>
          );
        })}
      </ol>
      {cancelled && (
        <p className="mt-2 text-xs font-semibold text-red-500">This deal was cancelled.</p>
      )}
    </div>
  );
}

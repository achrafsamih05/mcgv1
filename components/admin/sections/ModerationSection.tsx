"use client";

import { useState } from "react";
import { Ban, Trash2, TriangleAlert } from "lucide-react";
import type { FlaggedMessage } from "@/lib/admin/types";
import { flaggedMessages as seed } from "@/lib/admin/data";
import { Badge, Button, Panel, PanelHeader } from "../ui/primitives";
import { LiveModerationSection } from "./LiveModerationSection";

export function ModerationSection() {
  const [list, setList] = useState<FlaggedMessage[]>(seed);

  const remove = (id: string) => setList((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="space-y-6">
      {/* LIVE — moderation_flags queue bound to Supabase */}
      <LiveModerationSection />

      <Panel>
      <PanelHeader
        title="Flagged Message Queue"
        description={`${list.length} reported messages, newest first`}
      />
      {list.length === 0 ? (
        <div className="p-12 text-center text-navy-400">Queue cleared. No flagged messages.</div>
      ) : (
        <ul className="divide-y divide-navy-100">
          {list.map((m) => (
            <li key={m.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone="danger">
                    <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                    {m.reason}
                  </Badge>
                  <span className="text-xs text-navy-500">{m.reportedAt}</span>
                </div>
                <p className="mt-1.5 text-sm text-navy-800">
                  <span className="font-semibold">{m.from}</span> → <span className="font-semibold">{m.to}</span>
                </p>
                <p className="mt-0.5 truncate text-sm italic text-navy-600">“{m.excerpt}”</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm">
                  <Ban className="h-4 w-4" aria-hidden="true" />Warn / Ban User
                </Button>
                <Button variant="danger" size="sm" onClick={() => remove(m.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />Delete Message
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
    </div>
  );
}

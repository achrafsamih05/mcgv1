/**
 * Browser Supabase client — for use in Client Components only.
 *
 * Reads the public env vars (safe to expose). Cookie handling is delegated to
 * @supabase/ssr so the browser session stays in sync with the server. Typed
 * with the project `Database` so every query is statically checked (no `any`).
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** True when the public Supabase env vars are present (live mode). */
export const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

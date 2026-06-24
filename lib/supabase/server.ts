/**
 * Server Supabase client — for Server Components, Server Actions, and Route
 * Handlers. Uses Next.js `cookies()` so HTTP-only auth cookies are read and
 * refreshed correctly during SSR (prevents hydration mismatches).
 *
 * NOTE: `cookies()` is read-only inside Server Components. The try/catch around
 * set/remove is the official Supabase pattern — writes succeed in Server
 * Actions and Route Handlers, and are safely ignored in Server Components
 * (where the middleware refreshes the session instead).
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — ignore. Session refresh is
            // handled by the middleware.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // See note above.
          }
        },
      },
    }
  );
}

/**
 * Service-role client — server-only, bypasses RLS. Use ONLY in trusted
 * Route Handlers / Server Actions for Super Admin overrides. Never expose to
 * the browser and never call from a Client Component.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

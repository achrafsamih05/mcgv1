/**
 * Session helper for Edge Middleware.
 *
 * Creates a Supabase client bound to the incoming request cookies and an
 * outgoing NextResponse, so that any refreshed auth tokens are written back to
 * the browser. Returns both the response (to forward cookies) and the resolved
 * user, avoiding a second round-trip in the middleware guard.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Start with a passthrough response we can attach refreshed cookies to.
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Mirror the cookie onto both the request (for downstream reads in
          // this same pass) and the response (to persist in the browser).
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // IMPORTANT: getUser() revalidates the token with the Auth server and
  // triggers a cookie refresh when needed. Do not trust getSession() alone
  // for authorization decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}

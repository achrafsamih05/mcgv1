/**
 * Vercel Edge Middleware — role-based dashboard guard for MCG Global.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookies on every matched request.
 *   2. Redirect unauthenticated users to /auth.
 *   3. Resolve the user's platform role from the `profiles` table.
 *   4. Enforce that a user can only access the dashboard segment for their
 *      role; mismatches are redirected to their correct dashboard.
 *
 * The matched paths are the real App Router persona roots (/admin, /importer,
 * /supplier, /logistics, /warehouse). Public `/register` sub-routes are left
 * open so prospects can onboard before/without a session.
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ROLE_REDIRECT, type UserRole } from "@/lib/auth/roles";

// Persona dashboard root ⇄ platform role.
const ROLE_BY_SEGMENT: Record<string, UserRole> = {
  importer: "BUYER",
  supplier: "SUPPLIER",
  logistics: "DRIVER",
  warehouse: "WAREHOUSE_HOST",
  admin: "SUPER_ADMIN",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Leave public onboarding routes open (e.g. /supplier/register).
  if (pathname.includes("/register")) {
    return NextResponse.next();
  }

  // Refresh session + get the authenticated user (also forwards cookies).
  const { response, supabase, user } = await updateSession(request);

  // 1. Unauthenticated → send to login, preserving intended destination.
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth";
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Resolve the user's role from their profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole | undefined) ?? "BUYER";
  const correctPath = ROLE_REDIRECT[role];
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  // 3. Determine which persona root is being requested.
  const requestedSegment = pathname.split("/").filter(Boolean)[0];
  const segmentRole = ROLE_BY_SEGMENT[requestedSegment];

  // 4. Enforce role ↔ segment match. Admins may access any persona root.
  if (segmentRole && !isAdmin && segmentRole !== role) {
    const url = request.nextUrl.clone();
    url.pathname = correctPath;
    return NextResponse.redirect(url);
  }

  // Authorized — return the response carrying any refreshed auth cookies.
  return response;
}

export const config = {
  // Intercept the persona dashboard roots only. Public marketing pages,
  // /auth, and static assets are intentionally excluded.
  matcher: [
    "/admin/:path*",
    "/importer/:path*",
    "/supplier/:path*",
    "/logistics/:path*",
    "/warehouse/:path*",
  ],
};

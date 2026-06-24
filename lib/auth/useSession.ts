"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_REDIRECT, type UserRole } from "@/lib/auth/roles";

export interface SessionState {
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  fullName: string | null;
  /** Dashboard path for the active role, or null when signed out. */
  dashboardPath: string | null;
}

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SIGNED_OUT: SessionState = {
  loading: false,
  isAuthenticated: false,
  role: null,
  fullName: null,
  dashboardPath: null,
};

/**
 * Reads the live Supabase auth session + profile role on the client, and keeps
 * it in sync via `onAuthStateChange`. Degrades gracefully to a signed-out
 * state when Supabase env vars are absent (local/demo mode).
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ ...SIGNED_OUT, loading: SUPABASE_CONFIGURED });

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const supabase = createClient();
    let active = true;

    const resolve = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setState(SIGNED_OUT);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (!active) return;
      const role = (profile?.role as UserRole | undefined) ?? "BUYER";
      setState({
        loading: false,
        isAuthenticated: true,
        role,
        fullName: (profile?.full_name as string | undefined) ?? null,
        dashboardPath: ROLE_REDIRECT[role],
      });
    };

    supabase.auth.getUser().then(({ data }) => resolve(data.user?.id));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session?.user?.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

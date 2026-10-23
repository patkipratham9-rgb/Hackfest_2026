import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Server Components, Server Actions, and Route Handlers.
 * Configured with persistent session disabled to prevent cross-request leakage in SSR.
 */
export function createServerSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntjmoqcktsbsavatzppr.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50am1vcWNrdHNic2F2YXR6cHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzYwMTAsImV4cCI6MjEwODMxMjAxMH0.pGMYwVOr05tyRxx8m1ahg3nJSNMxB3maI6YjEGPjDKk";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

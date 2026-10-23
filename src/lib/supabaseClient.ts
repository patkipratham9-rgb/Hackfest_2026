import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntjmoqcktsbsavatzppr.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50am1vcWNrdHNic2F2YXR6cHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzYwMTAsImV4cCI6MjEwODMxMjAxMH0.pGMYwVOr05tyRxx8m1ahg3nJSNMxB3maI6YjEGPjDKk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

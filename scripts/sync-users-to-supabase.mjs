import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntjmoqcktsbsavatzppr.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50am1vcWNrdHNic2F2YXR6cHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzYwMTAsImV4cCI6MjEwODMxMjAxMH0.pGMYwVOr05tyRxx8m1ahg3nJSNMxB3maI6YjEGPjDKk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncUsers() {
  const usersPath = path.join(process.cwd(), "data", "localloop_users.json");
  if (!fs.existsSync(usersPath)) {
    console.log("No data/localloop_users.json file found.");
    return;
  }

  const raw = fs.readFileSync(usersPath, "utf-8");
  const data = JSON.parse(raw);
  const users = data.users || [];

  console.log(`Found ${users.length} users in local persistent database.`);

  for (const user of users) {
    console.log(`Syncing user: ${user.name} (${user.number || user.email}) [ID: ${user.id}]`);
    const { data: result, error } = await supabase.rpc("sync_user_profile", {
      p_id: user.id,
      p_full_name: user.name,
      p_phone: user.number || null,
      p_email: user.email || null,
      p_role: user.role || "customer",
      p_addresses: user.addresses || [],
    });

    if (error) {
      console.error(`  ❌ Failed to sync ${user.name}:`, error.message);
    } else {
      console.log(`  ✅ Successfully synced ${user.name} into Supabase profiles!`, result);
    }
  }
}

syncUsers();

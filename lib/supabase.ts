import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// True only when real credentials are provided (not the placeholder strings)
export const isSupabaseConfigured =
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 20;

// Create a real client only when configured; otherwise a no-op stub
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
    );

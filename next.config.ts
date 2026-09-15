import type { NextConfig } from "next";
import { SUPABASE_KEY, SUPABASE_URL } from "./lib/supabase-config";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep every existing client-side Supabase call on the same production
  // Supabase project instead of allowing stale Vercel environment variables
  // to point authentication at a different project.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: SUPABASE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_KEY,
  },
};

export default nextConfig;

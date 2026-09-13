/**
 * Coupon Queen production Supabase configuration.
 *
 * The production database for this repository is project
 * avgrfhprwckcpxqyozfo. Keep the URL canonical so a stale Vercel
 * NEXT_PUBLIC_SUPABASE_URL cannot silently send the app to another project.
 * The publishable key remains an environment variable and is never committed.
 */
export const SUPABASE_URL = "https://avgrfhprwckcpxqyozfo.supabase.co";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_KEY);
}

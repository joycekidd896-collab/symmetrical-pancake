/**
 * Coupon Queen production Supabase configuration.
 *
 * The production database for this repository is project
 * avgrfhprwckcpxqyozfo. The public Supabase publishable key is included
 * as a fallback so the client cannot break when Vercel environment
 * variables are missing or stale. This is a publishable/anon-level key;
 * service-role credentials must never be placed here.
 */
export const SUPABASE_URL = "https://avgrfhprwckcpxqyozfo.supabase.co";

const PRODUCTION_PUBLISHABLE_KEY =
  "sb_publishable_jhde8lTU8BIPSs76FIycDA_J8al4EK_";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  PRODUCTION_PUBLISHABLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_KEY);
}

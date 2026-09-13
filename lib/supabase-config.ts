/**
 * Coupon Queen production Supabase configuration.
 *
 * The production database for this repository is project
 * avgrfhprwckcpxqyozfo. The public Supabase publishable key is kept here
 * intentionally because it is publishable/anon-level. Service-role
 * credentials must never be placed here.
 *
 * IMPORTANT: Do not let a stale Vercel NEXT_PUBLIC_SUPABASE_* value override
 * the production project key. That was causing the live merchant auth page
 * to return "Invalid API key". Server secrets are not used by this client.
 */
export const SUPABASE_URL = "https://avgrfhprwckcpxqyozfo.supabase.co";

const PRODUCTION_PUBLISHABLE_KEY =
  "sb_publishable_jhde8lTU8BIPSs76FIycDA_J8al4EK_";

export const SUPABASE_KEY = PRODUCTION_PUBLISHABLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_KEY);
}

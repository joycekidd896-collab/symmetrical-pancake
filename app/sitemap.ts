import type { MetadataRoute } from "next";

const baseUrl = "https://couponqueen.online";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type MerchantRow = { id: string; updated_at?: string | null };
type CouponRow = { id: string; created_at?: string | null; expires_at?: string | null; merchants?: { is_approved?: boolean; is_active?: boolean } | null };

async function fetchPublicRows<T>(path: string): Promise<T[]> {
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: { apikey: supabaseKey },
      next: { revalidate: 1800 },
    });
    if (!response.ok) return [];
    return (await response.json()) as T[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [merchants, coupons] = await Promise.all([
    fetchPublicRows<MerchantRow>(
      "merchants?is_approved=eq.true&is_active=eq.true&select=id,updated_at&order=updated_at.desc&limit=5000"
    ),
    fetchPublicRows<CouponRow>(
      "coupons?status=eq.active&select=id,created_at,expires_at,merchants!inner(is_approved,is_active)&order=created_at.desc&limit=5000"
    ),
  ]);

  const liveCoupons = coupons.filter((coupon) => !coupon.expires_at || new Date(coupon.expires_at).getTime() > now.getTime());

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/coupons`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/businesses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/businesses/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/account/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${baseUrl}/businesses/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    ...merchants.map((merchant) => ({
      url: `${baseUrl}/businesses/${merchant.id}`,
      lastModified: merchant.updated_at ? new Date(merchant.updated_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    ...liveCoupons.map((coupon) => ({
      url: `${baseUrl}/coupons/${coupon.id}`,
      lastModified: coupon.created_at ? new Date(coupon.created_at) : now,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
  ];
}

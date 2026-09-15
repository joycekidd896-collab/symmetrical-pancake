import type { Metadata } from "next";

const siteUrl = "https://couponqueen.online";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Coupon = {
  id: string;
  title: string;
  description: string | null;
  discount_text: string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  merchant_id: string;
  merchants?: { business_name: string; is_approved?: boolean; is_active?: boolean } | null;
  categories?: { name: string } | null;
};

async function getCoupon(id: string) {
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/coupons?id=eq.${encodeURIComponent(id)}&status=eq.active&select=id,title,description,discount_text,status,starts_at,expires_at,merchant_id,merchants!inner(business_name,is_approved,is_active),categories(name)&limit=1`,
      { headers: { apikey: supabaseKey }, next: { revalidate: 900 } }
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as Coupon[];
    const coupon = rows[0];
    if (!coupon?.merchants?.is_approved || !coupon.merchants.is_active) return null;
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now()) return null;
    return coupon;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const coupon = await getCoupon(id);
  if (!coupon) return { title: "Deal Not Found" };

  const business = coupon.merchants?.business_name || "Coupon Queen Merchant";
  const category = coupon.categories?.name ? `${coupon.categories.name} deal` : "deal";
  const title = `${coupon.discount_text} ${coupon.title} | Coupon Queen`;
  const description = coupon.description || `${coupon.discount_text} ${category} from ${business}. Discover it in the Coupon Queen Deal Vault.`;
  const url = `${siteUrl}/coupons/${coupon.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, siteName: "Coupon Queen", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function CouponDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

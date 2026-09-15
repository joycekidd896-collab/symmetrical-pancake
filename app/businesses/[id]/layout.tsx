import type { Metadata } from "next";

const siteUrl = "https://couponqueen.online";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Merchant = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  is_approved: boolean;
  is_active: boolean;
};

async function getMerchant(id: string) {
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/merchants?id=eq.${encodeURIComponent(id)}&select=id,business_name,city,state,description,is_approved,is_active&limit=1`,
      { headers: { apikey: supabaseKey }, next: { revalidate: 1800 } }
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as Merchant[];
    const merchant = rows[0];
    return merchant?.is_approved && merchant.is_active ? merchant : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const merchant = await getMerchant(id);
  if (!merchant) return { title: "Business Not Found" };

  const location = [merchant.city, merchant.state].filter(Boolean).join(", ");
  const title = `${merchant.business_name}${location ? ` in ${location}` : ""} | Coupon Queen`;
  const description = merchant.description || `Discover live coupons and money-saving offers from ${merchant.business_name} on Coupon Queen.`;
  const url = `${siteUrl}/businesses/${merchant.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Coupon Queen", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function MerchantProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

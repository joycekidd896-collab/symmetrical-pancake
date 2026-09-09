"use client";

import { useEffect, useState } from "react";
import type { Coupon } from "../../lib/coupons";

export default function LiveOffers({ onLoad }: { onLoad: (offers: Coupon[]) => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) return;
        const response = await fetch(`${url}/rest/v1/business_offers?active=eq.true&select=id,discount,title,description,category,location,expires,businesses(name)&order=created_at.desc`, { headers: { apikey: key }, cache: "no-store" });
        if (!response.ok) return;
        const rows = await response.json();
        onLoad(rows.map((row: any) => ({ id: `live-${row.id}`, discount: row.discount, title: row.title, business: row.businesses?.name || "Local Business", category: row.category || "Other", location: row.location || "Local", description: row.description || "A live offer from the Coupon Queen Business Kingdom.", expires: row.expires || "Active offer", terms: ["One redemption per customer.", "Merchant terms may apply."] })));
      } finally { setLoading(false); }
    };
    load();
  }, [onLoad]);
  return loading ? <div aria-hidden="true" /> : null;
}

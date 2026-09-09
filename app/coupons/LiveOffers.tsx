"use client";

import { useEffect } from "react";
import type { Coupon } from "../../lib/coupons";

export default function LiveOffers({ onLoad }: { onLoad: (offers: Coupon[]) => void }) {
  useEffect(() => {
    const load = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) return;
        const response = await fetch(`${url}/rest/v1/business_offers?active=eq.true&select=id,discount,title,description,category,location,expires,expires_at,businesses(name)&order=created_at.desc`, { headers: { apikey: key }, cache: "no-store" });
        if (!response.ok) return;
        const rows = await response.json();
        const now = Date.now();
        onLoad(rows
          .filter((row: any) => !row.expires_at || new Date(row.expires_at).getTime() > now)
          .map((row: any) => ({
            id: `live-${row.id}`,
            discount: row.discount,
            title: row.title,
            business: row.businesses?.name || "Local Business",
            category: row.category || "Other",
            location: row.location || "Local",
            description: row.description || "A live offer from the Coupon Queen Business Kingdom.",
            expires: row.expires_at ? `Ends ${new Date(row.expires_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : (row.expires || "Active offer"),
            terms: ["One redemption per customer.", "Merchant terms may apply."]
          })));
      } catch {
        // Keep the customer page usable with its built-in offers if live loading fails.
      }
    };
    load();
  }, [onLoad]);
  return null;
}

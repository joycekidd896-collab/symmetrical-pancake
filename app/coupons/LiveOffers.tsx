"use client";

import { useEffect } from "react";
import type { Coupon } from "../../lib/coupons";

export default function LiveOffers({ onLoad }: { onLoad: (offers: Coupon[]) => void }) {
  useEffect(() => {
    const load = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) return;

        const response = await fetch(
          `${url}/rest/v1/coupons?status=eq.active&select=id,merchant_id,category_id,title,description,terms,discount_text,starts_at,expires_at,merchants(business_name,city,state),categories(name)&order=created_at.desc`,
          {
            headers: { apikey: key },
            cache: "no-store",
          },
        );

        if (!response.ok) return;
        const rows = await response.json();
        const now = Date.now();

        onLoad(
          rows
            .filter((row: any) => {
              const starts = row.starts_at ? new Date(row.starts_at).getTime() : 0;
              const expires = row.expires_at ? new Date(row.expires_at).getTime() : Infinity;
              return starts <= now && expires > now;
            })
            .map((row: any) => {
              const merchant = row.merchants;
              const category = row.categories?.name || "Other";
              const location = [merchant?.city, merchant?.state].filter(Boolean).join(", ") || "Nationwide";
              const terms = String(row.terms || "")
                .split(/\n|•/)
                .map((item: string) => item.trim())
                .filter(Boolean);

              return {
                id: row.id,
                business_id: row.merchant_id,
                discount: row.discount_text,
                title: row.title,
                business: merchant?.business_name || "Coupon Queen Merchant",
                category,
                location,
                description: row.description || "A live offer from the Coupon Queen Business Kingdom.",
                expires: row.expires_at
                  ? `Ends ${new Date(row.expires_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                  : "Active offer",
                terms: terms.length ? terms : ["One redemption per customer.", "Merchant terms may apply."],
              } satisfies Coupon;
            }),
        );
      } catch {
        // Keep the Deal Vault safely empty when the live request fails.
      }
    };

    load();
  }, [onLoad]);

  return null;
}

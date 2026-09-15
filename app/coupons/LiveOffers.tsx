"use client";
import { useEffect } from "react";
import type { Coupon } from "../../lib/coupons";
import { SUPABASE_KEY, SUPABASE_URL } from "../../lib/supabase-config";

export default function LiveOffers({ onLoad }: { onLoad: (offers: Coupon[]) => void }) {
  useEffect(() => {
    const load = async () => {
      try {
        if (!SUPABASE_KEY) return;

        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/coupons?status=eq.active&starts_at=lte.${encodeURIComponent(new Date().toISOString())}&merchants.is_approved=eq.true&merchants.is_active=eq.true&select=id,merchant_id,category_id,title,description,terms,discount_text,starts_at,expires_at,created_at,merchants!inner(business_name,city,state,is_approved,is_active),categories(name)&order=created_at.desc`,
          {
            headers: { apikey: SUPABASE_KEY },
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
              const merchant = row.merchants;
              return starts <= now && expires > now && merchant?.is_approved === true && merchant?.is_active === true;
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
                created_at: row.created_at,
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

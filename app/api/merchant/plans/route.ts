import { NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "../../../../lib/supabase-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!SUPABASE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/merchant_plans?is_active=eq.true&select=id,name,monthly_price_cents,description,features,stripe_price_id&order=monthly_price_cents.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Merchant plans query failed", response.status, detail);
      return NextResponse.json(
        { error: "Could not load merchant plans.", status: response.status },
        { status: 502 },
      );
    }

    const plans = await response.json();
    return NextResponse.json(plans, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Merchant plans API error", error);
    return NextResponse.json({ error: "Could not load merchant plans." }, { status: 500 });
  }
}

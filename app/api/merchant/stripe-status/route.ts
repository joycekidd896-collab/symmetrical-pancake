import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function GET() {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({
      configured: false,
      message: "Production Stripe secret is not configured in Vercel yet.",
    });
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          configured: false,
          message: data?.error?.message || "The configured Stripe secret could not authenticate.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      configured: true,
      message: "Production Stripe is connected.",
    });
  } catch {
    return NextResponse.json(
      { configured: false, message: "Stripe connection could not be verified." },
      { status: 502 },
    );
  }
}

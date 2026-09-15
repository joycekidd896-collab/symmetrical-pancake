# Coupon Queen 👑

**The Crown Jewel of Savings**

Coupon Queen is a nationwide coupon and merchant marketplace at **couponqueen.online**. Customers can discover live offers from participating businesses across the country, while merchants can create business profiles, publish offers, and verify redemptions.

## Production stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, RLS, and Edge Functions
- Vercel deployment

## Merchant experience

Merchants can:

- Create a merchant account
- Establish a business profile
- Publish live offers with expiration dates
- Manage and pause offers
- View redemption activity and analytics
- Verify customer redemption codes

Merchant subscription plans are handled through the Stripe checkout flow after the business profile exists.

## Customer experience

Customers can:

- Browse the Deal Vault
- View live merchant offers
- Open individual offer pages
- Sign in to claim live merchant deals
- Receive a server-generated redemption code
- Present the code to the merchant

Static/example coupons are kept separate from live merchant offers.

## Security

- Supabase Row Level Security protects merchant and customer data.
- Merchant redemption codes are generated server-side.
- Live redemption requires an authenticated customer.
- Expired or inactive merchant offers cannot be redeemed.
- Anonymous access to privileged RPC functions is revoked.
- Stripe webhook event storage is locked away from browser roles.
- Service-role credentials are never exposed to the browser.
- Secrets belong in deployment environment variables, never in Git.

## Repository

GitHub: `joycekidd896-collab/symmetrical-pancake`

The `main` branch is connected to the existing Coupon Queen Vercel integration. No replacement project is required.

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

## Project principles

1. Preserve working Coupon Queen functionality.
2. Keep merchant and customer data protected by RLS.
3. Never expose private credentials in client code.
4. Validate authentication and ownership server-side.
5. Keep live offers expiration-aware.
6. Keep the repository organized and avoid duplicate route trees.
7. Test production builds before release.
8. Keep public merchant and offer pages discoverable while private dashboards remain noindex.

## Domain

**couponqueen.online** is the official Coupon Queen domain.

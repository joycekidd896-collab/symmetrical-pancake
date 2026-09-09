# Coupon Queen 👑

**The Crown Jewel of Savings**

Coupon Queen is a local coupon and merchant marketplace at **couponqueen.online**. Customers can discover live local offers, while merchants can create businesses, publish offers, and verify redemptions.

## Production stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, RLS, and Edge Functions
- Vercel production deployment

## Merchant experience

Merchants can:

- Create a merchant account
- Establish a business profile
- Publish live offers with expiration dates
- Manage and pause offers
- View redemption activity and analytics
- Verify customer redemption codes

New accounts are onboarded before any optional paid checkout is started. Royal Starter trial access is available for initial testing; paid plans are handled through the merchant checkout flow after the business profile exists.

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

- Supabase Row Level Security protects merchant data.
- Merchant redemption codes are generated server-side.
- Live redemption requires an authenticated customer.
- Expired or inactive merchant offers cannot be redeemed.
- Service-role credentials are never exposed to the browser.
- Secrets belong in deployment environment variables, never in Git.

## Repository

GitHub: `joycekidd896-collab/symmetrical-pancake`

The `main` branch is connected to the existing Vercel project:

`joyce_stanford_elite_coupons_production_system`

No replacement Vercel project is required.

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

## Domain

**couponqueen.online** is the official Coupon Queen domain.

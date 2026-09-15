import Script from "next/script";

export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://couponqueen.online/#organization",
        name: "Coupon Queen",
        url: "https://couponqueen.online",
        slogan: "The Crown Jewel of Savings",
        description: "A nationwide coupon and merchant marketplace connecting shoppers with live money-saving offers from participating businesses.",
      },
      {
        "@type": "WebSite",
        "@id": "https://couponqueen.online/#website",
        url: "https://couponqueen.online",
        name: "Coupon Queen",
        description: "Find live coupons, local offers, and money-saving deals from participating businesses across the country.",
        publisher: { "@id": "https://couponqueen.online/#organization" },
      },
    ],
  };

  return (
    <Script id="coupon-queen-structured-data" type="application/ld+json">
      {JSON.stringify(data)}
    </Script>
  );
}

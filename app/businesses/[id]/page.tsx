"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Business = { id:string; name:string; location:string|null; category:string|null; description:string|null };
type Offer = { id:string; discount:string; title:string; description:string|null; category:string|null; location:string|null; expires:string|null; expires_at:string|null; active:boolean };

const URL=process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function BusinessProfilePage({ params }: { params: { id:string } }) {
  const [business,setBusiness]=useState<Business|null>(null);
  const [offers,setOffers]=useState<Offer[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    const load=async()=>{
      try{
        if(!URL||!KEY){setError("Business information is temporarily unavailable.");return;}
        const headers={apikey:KEY};
        const res=await fetch(`${URL}/rest/v1/businesses?id=eq.${encodeURIComponent(params.id)}&select=id,name,location,category,description&limit=1`,{headers,cache:"no-store"});
        if(!res.ok)throw new Error();
        const rows=await res.json();
        if(!rows[0]){setError("Business not found.");return;}
        setBusiness(rows[0]);
        const offersRes=await fetch(`${URL}/rest/v1/business_offers?business_id=eq.${encodeURIComponent(params.id)}&active=eq.true&select=id,discount,title,description,category,location,expires,expires_at&order=created_at.desc`,{headers,cache:"no-store"});
        if(offersRes.ok){
          const now=Date.now();
          const offerRows=await offersRes.json();
          setOffers(offerRows.filter((o:Offer)=>!o.expires_at||new Date(o.expires_at).getTime()>now));
        }
      }catch{setError("We couldn't load this business right now.");}
      finally{setLoading(false);}
    };
    load();
  },[params.id]);

  const location=business?.location?.trim()||"Local location";
  const mapsUrl=business?.location?.trim()?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location)}`:"";
  const category=business?.category||"Local Business";

  const intro=useMemo(()=>business?.description?.trim()||`${business?.name||"This business"} is part of the Coupon Queen Business Kingdom. Discover current offers and save when you shop locally.`,[business]);

  if(loading)return <main className="queen-page"><div className="business-loading">♛ Loading business profile…</div><style jsx>{`.business-loading{min-height:70vh;display:grid;place-items:center;font-size:18px;font-weight:900;color:var(--queen-espresso)}`}</style></main>;
  if(error||!business)return <main className="queen-page"><header className="site-header"><Link href="/" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav></header><section className="empty"><div className="card-icon gold-icon">👑</div><h1>Business Not Found</h1><p>{error||"This business profile is unavailable."}</p><Link href="/coupons" className="queen-button primary-button">Back to Deal Vault →</Link></section><style jsx>{`.empty{max-width:720px;margin:90px auto;text-align:center;padding:40px 20px}.empty h1{margin:18px 0 8px}.empty p{color:var(--queen-muted);margin-bottom:26px}`}</style></main>;

  return <main className="queen-page">
    <header className="site-header"><Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav aria-label="Main navigation"><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav><div className="header-sparkle">✦</div></header>
    <section className="business-hero"><div className="business-crest">♛</div><div className="section-kicker">♢ BUSINESS KINGDOM PROFILE ♢</div><div className="category-badge">{category}</div><h1>{business.name}</h1><p className="business-intro">{intro}</p><div className="business-location"><span>📍</span><strong>{location}</strong></div><div className="business-actions">{mapsUrl&&<a href={mapsUrl} target="_blank" rel="noreferrer" className="queen-button primary-button">Open in Maps <span>↗</span></a>}<Link href="/coupons" className="queen-button secondary-button">Browse All Deals <span>→</span></Link></div></section>
    <section className="benefits-section"><div className="section-heading"><div className="section-kicker">✦ CURRENT OFFERS ✦</div><h2>Deals from {business.name}</h2><p>{offers.length?`Find ${offers.length} live ${offers.length===1?"offer":"offers"} from this business.`:"This business doesn't have any live offers right now."}</p></div>
      {offers.length?<div className="offer-grid">{offers.map(o=><article className="offer-card" key={o.id}><div className="card-icon gold-icon">🎟️</div><div className="card-number">{o.discount}</div><div className="coupon-category">{o.category||category}</div><h3>{o.title}</h3><p>{o.description||"A live offer from the Coupon Queen Business Kingdom."}</p><div className="offer-meta"><span>📍 {o.location||location}</span><span>♛ {o.expires_at?`Ends ${new Date(o.expires_at).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`:(o.expires||"Active offer")}</span></div><Link href={`/coupons/live-${o.id}`} className="card-link">Get Deal <span>→</span></Link></article>)}</div>:<div className="no-offers"><div className="card-icon">💎</div><h3>No live deals right now</h3><p>Check back soon—new merchant offers can be published at any time.</p><Link href="/coupons" className="card-link">Explore the Deal Vault →</Link></div>}
    </section>
    <section className="royal-banner"><div className="banner-diamond">◆</div><div><div className="banner-kicker">DISCOVER LOCAL SAVINGS</div><h2>Every great deal deserves a crown.</h2></div><Link href="/coupons" className="queen-button secondary-button">Explore Deals <span className="button-arrow">→</span></Link></section>
    <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div><div className="footer-sparkles">✦ ✧ ✦</div></footer>
    <style jsx>{`.business-hero{max-width:1000px;margin:0 auto;padding:70px 20px 56px;text-align:center;position:relative}.business-crest{font-size:46px;color:var(--queen-gold);margin-bottom:10px}.category-badge{display:inline-block;margin:14px 0;padding:7px 13px;border:1px solid var(--queen-border);border-radius:999px;background:white;color:var(--queen-turquoise-dark);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.business-hero h1{font-size:clamp(38px,7vw,68px);margin:8px 0 16px;color:var(--queen-espresso)}.business-intro{max-width:700px;margin:0 auto;color:var(--queen-muted);font-size:17px;line-height:1.75}.business-location{display:inline-flex;align-items:center;gap:9px;margin:24px auto;padding:13px 18px;border:1px solid var(--queen-border);border-radius:14px;background:white;box-shadow:0 10px 28px rgba(0,0,0,.05);color:var(--queen-espresso)}.business-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:8px}.offer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1120px;margin:0 auto}.offer-card{padding:26px;border:1px solid var(--queen-border);border-radius:22px;background:white;box-shadow:0 14px 34px rgba(47,35,24,.07)}.offer-card h3{font-size:21px;margin:10px 0 8px}.offer-card p{color:var(--queen-muted);line-height:1.6}.offer-meta{display:flex;flex-direction:column;gap:8px;margin-top:18px;color:var(--queen-muted);font-size:13px;font-weight:800}.card-link{display:inline-flex;align-items:center;gap:8px;margin-top:18px;font-weight:900;color:var(--queen-turquoise-dark);text-decoration:none}.card-link:hover{text-decoration:underline}.no-offers{max-width:650px;margin:0 auto;text-align:center;padding:40px 22px;border:1px dashed var(--queen-border);border-radius:22px;background:white}.no-offers p{color:var(--queen-muted)}@media(max-width:820px){.offer-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.offer-grid{grid-template-columns:1fr}.business-hero{padding-top:48px}.business-intro{font-size:15px}.business-actions .queen-button{width:100%;justify-content:center}}`}</style>
  </main>;
}

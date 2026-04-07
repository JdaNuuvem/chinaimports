"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function AnalyticsTracker({ gaId, pixelId }: { gaId?: string; pixelId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    // GA4 pageview
    if (gaId && window.gtag) {
      window.gtag("config", gaId, { page_path: url });
    }
    // Facebook Pixel pageview
    if (pixelId && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams, gaId, pixelId]);

  return null;
}

export default function Analytics({ gaId, pixelId, nonce }: { gaId?: string; pixelId?: string; nonce?: string }) {
  if (!gaId && !pixelId) return null;

  // LGPD: Only load analytics after cookie consent
  const hasConsent = typeof window !== "undefined" && localStorage.getItem("ua_cookie_consent") === "accepted";
  if (!hasConsent) return null;

  return (
    <>
      {/* GA4 */}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} nonce={nonce} />
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      {pixelId && (
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
          }}
        />
      )}

      <Suspense fallback={null}>
        <AnalyticsTracker gaId={gaId} pixelId={pixelId} />
      </Suspense>
    </>
  );
}

// E-commerce event helpers
export function trackAddToCart(product: { id: string; title: string; price: number; quantity: number }) {
  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "BRL",
      value: product.price / 100,
      items: [{ item_id: product.id, item_name: product.title, price: product.price / 100, quantity: product.quantity }],
    });
  }
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      value: product.price / 100,
      currency: "BRL",
    });
  }
}

export function trackPurchase(order: { id: string; total: number; items: { id: string; title: string; price: number; quantity: number }[] }) {
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: order.id,
      currency: "BRL",
      value: order.total / 100,
      items: order.items.map((i) => ({ item_id: i.id, item_name: i.title, price: i.price / 100, quantity: i.quantity })),
    });
  }
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: order.items.map((i) => i.id),
      value: order.total / 100,
      currency: "BRL",
    });
  }
}

export function trackViewContent(product: { id: string; title: string; price: number }) {
  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: "BRL",
      value: product.price / 100,
      items: [{ item_id: product.id, item_name: product.title, price: product.price / 100 }],
    });
  }
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      value: product.price / 100,
      currency: "BRL",
    });
  }
}

export function trackSearch(query: string) {
  if (window.gtag) {
    window.gtag("event", "search", { search_term: query });
  }
  if (window.fbq) {
    window.fbq("track", "Search", { search_string: query });
  }
}

export function trackBeginCheckout(cart: { total: number; items: { id: string; title: string; price: number; quantity: number }[] }) {
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "BRL",
      value: cart.total / 100,
      items: cart.items.map((i) => ({ item_id: i.id, item_name: i.title, price: i.price / 100, quantity: i.quantity })),
    });
  }
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: cart.total / 100,
      currency: "BRL",
    });
  }
}

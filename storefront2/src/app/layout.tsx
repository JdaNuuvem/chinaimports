import type { Metadata } from "next";
import "./globals.css";
import "@/styles/theme.css";
import "@/styles/globals.css";
import { getNonce } from "@/lib/csp-nonce";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import CartErrorBoundary from "@/components/CartErrorBoundary";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import NewsletterBar from "@/components/Newsletter";
import Footer from "@/components/Footer";
import SupportButton from "@/components/SupportButton";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import SocialProof from "@/components/SocialProof";
import ExitIntent from "@/components/ExitIntent";
import ThemeStyles from "@/components/ThemeStyles";
import { OrganizationJsonLd } from "@/components/JsonLd";
import Analytics from "@/components/Analytics";
import FirstPurchasePopup from "@/components/FirstPurchasePopup";
import AbandonedCartDetector from "@/components/AbandonedCartDetector";
import SkipToContent from "@/components/SkipToContent";
import CouponAutoApply from "@/components/CouponAutoApply";
import ErrorTrackingInit from "@/components/ErrorTrackingInit";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import SentinelTracker from "@/components/SentinelTracker";
import { getPublicConfig } from "@/lib/public-config";
import { readThemeConfigFromDisk, ensureConfigFile } from "@/lib/theme-config.server";
import { ThemeConfigProvider } from "@/context/ThemeConfigContext";
import themeConfig from "@/data/theme-config.json";

// Force the root layout to re-render on every request so Header/Footer
// pick up the latest theme-config from disk (via getThemeConfig()).
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://importschinabrasil.com.br";
const storeName = themeConfig.identity.storeName || "Imports China Brasil";

export const metadata: Metadata = {
  title: `${storeName} - Produtos Importados com os Melhores Preços`,
  description: `Compre produtos importados na ${storeName}. Frete grátis para todo Brasil. Smartphones, eletrônicos e mais.`,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
      "en": "/en",
      "es": "/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: storeName,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = await getNonce();
  const publicConfig = await getPublicConfig();
  ensureConfigFile();
  const liveThemeConfig = readThemeConfigFromDisk();

  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e2d7d" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" as="style" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <ThemeStyles />
        <OrganizationJsonLd />
        <SentinelTracker
          apiKey={publicConfig.SENTINEL_API_KEY}
          nonce={nonce}
        />
      </head>
      <body className="Evolution--v1">
        <ThemeConfigProvider config={liveThemeConfig}>
        <LocaleProvider>
        <CartErrorBoundary>
          <CartProvider>
            <ErrorTrackingInit />
            <WebVitalsReporter />
            <SkipToContent />
            <AnnouncementBar />
            <Header />
            <main id="main" role="main">
              {children}
            </main>
            <NewsletterBar />
            <Footer />
            <SupportButton />
            <BackToTop />
            <SocialProof />
            <ExitIntent />
            <FirstPurchasePopup />
            <AbandonedCartDetector />
            <CouponAutoApply />
            <CookieConsent />
            <Analytics
              gaId={publicConfig.GA_ID}
              pixelId={publicConfig.FB_PIXEL_ID}
              nonce={nonce}
            />
          </CartProvider>
        </CartErrorBoundary>
        </LocaleProvider>
        </ThemeConfigProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";
import { OrganizationSchema } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { SITE, SITE_URL } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBF8F3",
};

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LocalLoop | Neighbourhood Shops in Hubballi-Dharwad",
    template: "%s | LocalLoop",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Hubballi",
    "Dharwad",
    "Hubli local shops",
    "online grocery Hubballi",
    "Dharwad Pedha",
    "Vidyanagar",
    "Station Road",
    "counter pickup",
    "home delivery Hubballi",
  ],
  authors: [{ name: "Team Digital Titans", url: "https://kletech.ac.in" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // The share image comes from src/app/opengraph-image.tsx (file convention).
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: "LocalLoop | Neighbourhood Shops in Hubballi-Dharwad",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalLoop | Neighbourhood Shops in Hubballi-Dharwad",
    description: SITE.description,
  },
  // Google Search Console ownership token. Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  // to the "content" value of the HTML-tag verification method.
  ...(googleSiteVerification ? { verification: { google: googleSiteVerification } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-cream-100 text-forest-950 font-sans antialiased selection:bg-terracotta-200 selection:text-terracotta-900 overflow-x-hidden w-full max-w-full"
      >
        <OrganizationSchema />
        <AuthProvider>
          <CartProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </CartProvider>
        </AuthProvider>
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="lazyOnload"
        />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

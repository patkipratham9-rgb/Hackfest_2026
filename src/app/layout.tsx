import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBF8F3",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://localloop.in"),
  title: {
    default: "LocalLoop • Hubballi's Hyperlocal Digital Marketplace",
    template: "%s • LocalLoop Hubballi",
  },
  description:
    "Discover, compare, and order authentic goods from neighborhood corner shops in Hubballi-Dharwad. 0% commission local marketplace with express counter pickup.",
  keywords: [
    "Hubballi",
    "Dharwad",
    "hyperlocal",
    "marketplace",
    "Dharwad Pedha",
    "Vidyanagar",
    "Station Road",
    "local shopping",
    "express counter pickup",
  ],
  authors: [{ name: "Team Digital Titans", url: "https://kletech.ac.in" }],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    title: "LocalLoop • Hubballi's Hyperlocal Digital Marketplace",
    description:
      "Support authentic neighborhood corner shops in Hubballi-Dharwad. Browse local catalogs, reserve items, and pick up fresh at the counter.",
    siteName: "LocalLoop Hubballi",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 800, alt: "LocalLoop Logo" }],
  },
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
        <AuthProvider>
          <CartProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </CartProvider>
        </AuthProvider>
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

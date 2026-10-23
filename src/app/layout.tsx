import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ProfilePanel } from "@/components/ProfilePanel";
import { Footer } from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBF8F3",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://localloop.vercel.app"),
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
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "LocalLoop • Hubballi's Hyperlocal Digital Marketplace",
    description:
      "Support authentic neighborhood corner shops in Hubballi-Dharwad. Browse local catalogs, reserve items, and pick up fresh at the counter.",
    siteName: "LocalLoop Hubballi",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="min-h-screen bg-cream-100 text-forest-950 font-sans antialiased selection:bg-terracotta-200 selection:text-terracotta-900 overflow-x-hidden w-full max-w-full">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <CheckoutModal />
            <ProfilePanel />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-12 w-full overflow-x-hidden">
              {children}
            </main>
            <Footer />
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

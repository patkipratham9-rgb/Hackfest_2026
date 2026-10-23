import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ProfilePanel } from "@/components/ProfilePanel";

export const metadata: Metadata = {
  title: "LocalLoop • Your City's Digital Marketplace",
  description: "Discover, compare and buy from authentic neighborhood corner shops. Think local. Shop smarter. Grow together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-100 text-forest-950 font-sans antialiased selection:bg-terracotta-200 selection:text-terracotta-900 overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <CheckoutModal />
            <ProfilePanel />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-12">
              {children}
            </main>
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

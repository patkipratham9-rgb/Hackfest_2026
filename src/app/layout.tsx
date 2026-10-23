import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";

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
      <body className="min-h-screen bg-cream-100 text-forest-950 font-sans antialiased selection:bg-terracotta-200 selection:text-terracotta-900 pb-20 sm:pb-8">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <CheckoutModal />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}

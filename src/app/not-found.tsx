"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect unknown addresses to Home
    const timer = setTimeout(() => {
      router.replace("/");
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600">
        <Compass className="w-6 h-6 animate-spin" />
      </div>
      <div>
        <h2 className="font-serif font-bold text-lg text-forest-950">
          Page Not Found
        </h2>
        <p className="text-xs text-forest-600 mt-1">
          Redirecting you to LocalLoop Hubballi Home...
        </p>
      </div>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-terracotta-500 text-white text-xs font-bold shadow-warm hover:bg-terracotta-600 transition-colors"
      >
        Go to Home Now
      </Link>
    </div>
  );
}

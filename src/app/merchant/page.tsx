"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MerchantIndexPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.role === "seller") {
        router.replace("/seller");
      } else {
        router.replace("/merchant/login");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-terracotta-500 border-t-transparent animate-spin" />
    </div>
  );
}

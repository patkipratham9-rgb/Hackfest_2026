"use client";

import React from "react";
import { SellerProvider } from "@/context/SellerContext";

export default function MerchantRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerProvider>{children}</SellerProvider>;
}

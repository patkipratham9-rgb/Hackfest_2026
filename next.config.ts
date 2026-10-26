import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/",
        statusCode: 301,
      },
      {
        source: "/storefront",
        destination: "/",
        statusCode: 301,
      },
      {
        source: "/stores",
        destination: "/categories",
        statusCode: 301,
      },
      {
        source: "/faq",
        destination: "/help",
        statusCode: 301,
      },
      {
        source: "/support",
        destination: "/help",
        statusCode: 301,
      },
      {
        source: "/feedback",
        destination: "/contact",
        statusCode: 301,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        statusCode: 301,
      },
      {
        source: "/legal",
        destination: "/policies",
        statusCode: 301,
      },
      {
        source: "/legal/privacy",
        destination: "/privacy",
        statusCode: 301,
      },
      {
        source: "/legal/terms",
        destination: "/terms",
        statusCode: 301,
      },
      {
        source: "/returns",
        destination: "/policies",
        statusCode: 301,
      },
      {
        source: "/merchant",
        destination: "/seller",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(account|orders|seller|payment-result)/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

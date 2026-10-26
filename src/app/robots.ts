import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt
 *
 * Private pages (account, orders, seller portal, login, payment result) are not
 * blocked here on purpose: they send an X-Robots-Tag: noindex header (see
 * next.config.ts) and a robots meta tag, and Google can only see those if it
 * is allowed to crawl the URL. Only machine endpoints are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

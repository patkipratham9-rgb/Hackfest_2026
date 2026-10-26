import { CUSTOMER_SUPPORT } from "@/lib/legalPolicies";

/**
 * Single source of truth for site-wide identity used by metadata, the sitemap,
 * robots.txt, JSON-LD structured data and the Open Graph image.
 *
 * Only facts that already appear elsewhere in the product are listed here.
 * Do not add ratings, review counts, founding dates or social profiles unless
 * they are real and verifiable.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://localloop.in").replace(/\/+$/, "");

export const SITE = {
  name: "LocalLoop",
  legalName: "LocalLoop Hubballi",
  shortDescription:
    "Order from neighbourhood shops in Hubballi-Dharwad for home delivery or counter pickup.",
  description:
    "LocalLoop lists independent shops in Hubballi-Dharwad. Browse their catalogues, then choose home delivery or pick up your order at the counter.",
  locale: "en_IN",
  logoPath: "/logo.png",
  email: CUSTOMER_SUPPORT.deskEmail,
  phone: CUSTOMER_SUPPORT.helpline,
  address: {
    streetAddress: "Localloop Headquarters",
    addressLocality: "Hubballi",
    addressRegion: "Karnataka",
    postalCode: "580031",
    addressCountry: "IN",
  },
  areaServed: ["Hubballi", "Dharwad"],
} as const;

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

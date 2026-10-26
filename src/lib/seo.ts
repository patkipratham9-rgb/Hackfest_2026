import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

interface PageSeoInput {
  /** Page-specific title. The root layout template appends " | LocalLoop". */
  title: string;
  /** 50-160 characters, written for people reading search results. */
  description: string;
  /** Path of the canonical URL, e.g. "/help". */
  path: string;
  /** Private or transactional pages that should never appear in search results. */
  noindex?: boolean;
}

/**
 * Builds per-route metadata with a unique title, meta description,
 * self-referencing canonical URL and matching Open Graph / Twitter tags.
 *
 * The Open Graph image is supplied by the file convention in
 * src/app/opengraph-image.tsx and is inherited by every route.
 */
export function pageMetadata({ title, description, path, noindex = false }: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

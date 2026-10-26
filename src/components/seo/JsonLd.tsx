import React from "react";
import { SITE, SITE_URL, absoluteUrl } from "@/lib/site";

/**
 * Renders a JSON-LD <script>. "<" is escaped so user-controlled strings can
 * never close the script tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Organization + WebSite structured data, rendered once in the root layout. */
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(SITE.logoPath),
        },
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phone,
        address: {
          "@type": "PostalAddress",
          ...SITE.address,
        },
        areaServed: SITE.areaServed.map((name) => ({ "@type": "City", name })),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: SITE.email,
            telephone: SITE.phone,
            areaServed: "IN",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        inLanguage: "en-IN",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
  return <JsonLd data={data} />;
}

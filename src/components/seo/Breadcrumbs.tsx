import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";

export interface BreadcrumbItem {
  name: string;
  /** Omit for the current page (last item). */
  href?: string;
}

/**
 * Visible breadcrumb trail plus matching BreadcrumbList structured data.
 * "Home" is prepended automatically. Safe to use in server and client components.
 */
export function Breadcrumbs({ items, className = "" }: { items: BreadcrumbItem[]; className?: string }) {
  const trail: BreadcrumbItem[] = [{ name: "Home", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-xs text-forest-600 ${className}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-1">
                {item.href && !isLast ? (
                  <Link href={item.href} className="font-medium hover:text-terracotta-700 hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-bold text-forest-900">
                    {item.name}
                  </span>
                )}
                {!isLast && <ChevronRight aria-hidden="true" className="w-3 h-3 text-forest-400" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={schema} />
    </>
  );
}

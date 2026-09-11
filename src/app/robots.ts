import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventes.cavalons.fr";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/mon-compte", "/messages", "/visites", "/api/"] }, sitemap: `${base}/sitemap.xml` };
}

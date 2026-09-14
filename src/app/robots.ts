import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/mon-compte", "/messages", "/visites", "/api/"] }, sitemap: `${base}/sitemap.xml` };
}

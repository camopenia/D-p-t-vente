import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { GUIDES } from "@/lib/content/guides";
import { CONTRACT_TEMPLATES } from "@/lib/content/contracts";
import { searchListings } from "@/lib/listings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const statics = ["", "/chevaux", "/pros", "/guides", "/contrats", "/abonnement", "/comment-ca-marche", "/charte", "/cgu", "/confidentialite", "/contact", "/vendre"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const }));
  const guides = GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, changeFrequency: "monthly" as const }));
  const contracts = Object.keys(CONTRACT_TEMPLATES).map((t) => ({ url: `${base}/contrats/${t}`, changeFrequency: "monthly" as const }));
  let listings: MetadataRoute.Sitemap = [];
  try {
    const { items } = await searchListings({ sort: "recent" });
    listings = items.map((l) => ({ url: `${base}/chevaux/${l.slug}`, lastModified: l.updated_at, changeFrequency: "daily" as const }));
  } catch {}
  return [...statics, ...guides, ...contracts, ...listings];
}

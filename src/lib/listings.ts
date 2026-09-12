import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { demoListings, demoProfiles } from "./demo-data";
import type { Listing, ListingFilters, Profile } from "./types";
import { horseAge } from "./constants";

export const PAGE_SIZE = 12;

const SELLER_SELECT = "seller:ventes_public_profiles!ventes_listings_seller_id_fkey(id, display_name, role, is_verified, city, region, avatar_url, slug, company_name)";

function applyDemoFilters(items: Listing[], f: ListingFilters) {
  let out = items.filter((l) => l.status === "active" || l.status === "reserved");
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((l) => [l.title, l.horse_name, l.breed, l.description, l.sire_name, l.city].join(" ").toLowerCase().includes(q));
  }
  if (f.breed) out = out.filter((l) => l.breed === f.breed);
  if (f.sex) out = out.filter((l) => l.sex === f.sex);
  if (f.discipline) out = out.filter((l) => l.disciplines.includes(f.discipline!));
  if (f.level) out = out.filter((l) => l.level === f.level);
  if (f.region) out = out.filter((l) => l.region === f.region);
  if (f.papers) out = out.filter((l) => l.papers === f.papers);
  if (f.sellerRole) out = out.filter((l) => l.seller?.role === f.sellerRole);
  if (f.priceMin != null) out = out.filter((l) => (l.price ?? 0) >= f.priceMin!);
  if (f.priceMax != null) out = out.filter((l) => (l.price ?? 0) <= f.priceMax!);
  if (f.ageMin != null) out = out.filter((l) => (horseAge(l.birth_year) ?? 0) >= f.ageMin!);
  if (f.ageMax != null) out = out.filter((l) => (horseAge(l.birth_year) ?? 0) <= f.ageMax!);
  if (f.heightMin != null) out = out.filter((l) => (l.height_cm ?? 0) >= f.heightMin!);
  if (f.heightMax != null) out = out.filter((l) => (l.height_cm ?? 999) <= f.heightMax!);
  if (f.xrays) out = out.filter((l) => l.xrays_available);
  if (f.trial) out = out.filter((l) => l.trial_available);
  switch (f.sort) {
    case "price_asc":
      out.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "price_desc":
      out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "age_asc":
      out.sort((a, b) => b.birth_year - a.birth_year);
      break;
    default:
      out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.created_at.localeCompare(a.created_at));
  }
  return out;
}

export async function searchListings(f: ListingFilters): Promise<{ items: Listing[]; total: number; page: number; pages: number }> {
  const page = Math.max(1, f.page ?? 1);
  if (!isSupabaseConfigured()) {
    const all = applyDemoFilters(demoListings, f);
    const start = (page - 1) * PAGE_SIZE;
    return { items: all.slice(start, start + PAGE_SIZE), total: all.length, page, pages: Math.max(1, Math.ceil(all.length / PAGE_SIZE)) };
  }
  const supabase = (await createClient())!;
  let q = supabase.from("ventes_listings").select(`*, ${SELLER_SELECT}`, { count: "exact" }).in("status", ["active", "reserved"]);
  if (f.q) q = q.textSearch("search_vector", f.q, { type: "websearch", config: "simple" });
  if (f.breed) q = q.eq("breed", f.breed);
  if (f.sex) q = q.eq("sex", f.sex);
  if (f.discipline) q = q.contains("disciplines", [f.discipline]);
  if (f.level) q = q.eq("level", f.level);
  if (f.region) q = q.eq("region", f.region);
  if (f.papers) q = q.eq("papers", f.papers);
  if (f.priceMin != null) q = q.gte("price", f.priceMin);
  if (f.priceMax != null) q = q.lte("price", f.priceMax);
  const year = new Date().getFullYear();
  if (f.ageMin != null) q = q.lte("birth_year", year - f.ageMin);
  if (f.ageMax != null) q = q.gte("birth_year", year - f.ageMax);
  if (f.heightMin != null) q = q.gte("height_cm", f.heightMin);
  if (f.heightMax != null) q = q.lte("height_cm", f.heightMax);
  if (f.xrays) q = q.eq("xrays_available", true);
  if (f.trial) q = q.eq("trial_available", true);
  switch (f.sort) {
    case "price_asc":
      q = q.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      q = q.order("price", { ascending: false, nullsFirst: false });
      break;
    case "age_asc":
      q = q.order("birth_year", { ascending: false });
      break;
    default:
      q = q.order("featured", { ascending: false }).order("published_at", { ascending: false, nullsFirst: false });
  }
  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1);
  if (error) {
    console.error("searchListings:", error.message);
    return { items: [], total: 0, page, pages: 1 };
  }
  let items = (data ?? []) as unknown as Listing[];
  if (f.sellerRole) items = items.filter((l) => l.seller?.role === f.sellerRole);
  const total = count ?? items.length;
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const { items } = await searchListings({ sort: "recent" });
  return items.slice(0, limit);
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (!isSupabaseConfigured()) return demoListings.find((l) => l.slug === slug) ?? null;
  const supabase = (await createClient())!;
  const { data } = await supabase.from("ventes_listings").select(`*, ${SELLER_SELECT}`).eq("slug", slug).maybeSingle();
  return (data as unknown as Listing) ?? null;
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured()) return demoListings.find((l) => l.id === id) ?? null;
  const supabase = (await createClient())!;
  const { data } = await supabase.from("ventes_listings").select(`*, ${SELLER_SELECT}`).eq("id", id).maybeSingle();
  return (data as unknown as Listing) ?? null;
}

export async function getSellerListings(sellerId: string, includeAll = false): Promise<Listing[]> {
  if (!isSupabaseConfigured()) return demoListings.filter((l) => l.seller_id === sellerId);
  const supabase = (await createClient())!;
  let q = supabase.from("ventes_listings").select(`*, ${SELLER_SELECT}`).eq("seller_id", sellerId).order("created_at", { ascending: false });
  if (!includeAll) q = q.in("status", ["active", "reserved", "sold"]);
  const { data } = await q;
  return ((data ?? []) as unknown as Listing[]) ?? [];
}

export async function getSimilarListings(listing: Listing, limit = 3): Promise<Listing[]> {
  const { items } = await searchListings({ discipline: listing.disciplines[0], sort: "recent" });
  const others = items.filter((l) => l.id !== listing.id);
  if (others.length >= limit) return others.slice(0, limit);
  const { items: more } = await searchListings({ sort: "recent" });
  return [...others, ...more.filter((l) => l.id !== listing.id && !others.some((o) => o.id === l.id))].slice(0, limit);
}

export type PublicProfile = Pick<Profile, "id" | "role" | "display_name" | "slug" | "avatar_url" | "bio" | "city" | "region" | "company_name" | "website" | "is_verified" | "created_at">;

export async function getProfessionals(): Promise<PublicProfile[]> {
  if (!isSupabaseConfigured()) return demoProfiles.filter((p) => p.role === "eleveur" || p.role === "pro_depot");
  const supabase = (await createClient())!;
  const { data } = await supabase.from("ventes_public_profiles").select("*").in("role", ["eleveur", "pro_depot"]).order("is_verified", { ascending: false }).order("created_at", { ascending: false });
  return (data ?? []) as PublicProfile[];
}

export async function getPublicProfile(idOrSlug: string): Promise<PublicProfile | null> {
  if (!isSupabaseConfigured()) return demoProfiles.find((p) => p.slug === idOrSlug || p.id === idOrSlug) ?? null;
  const supabase = (await createClient())!;
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
  const { data } = await supabase.from("ventes_public_profiles").select("*").eq(isUuid ? "id" : "slug", idOrSlug).maybeSingle();
  return (data as PublicProfile) ?? null;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): ListingFilters {
  const g = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) ?? "";
  const n = (k: string) => (g(k) ? Number(g(k)) : undefined);
  return {
    q: g("q") || undefined,
    breed: g("breed") || undefined,
    sex: (g("sex") as ListingFilters["sex"]) || "",
    discipline: g("discipline") || undefined,
    level: (g("level") as ListingFilters["level"]) || "",
    region: g("region") || undefined,
    papers: (g("papers") as ListingFilters["papers"]) || "",
    sellerRole: (g("sellerRole") as ListingFilters["sellerRole"]) || "",
    priceMin: n("priceMin"),
    priceMax: n("priceMax"),
    ageMin: n("ageMin"),
    ageMax: n("ageMax"),
    heightMin: n("heightMin"),
    heightMax: n("heightMax"),
    xrays: g("xrays") === "1",
    trial: g("trial") === "1",
    sort: (g("sort") as ListingFilters["sort"]) || "recent",
    page: n("page") ?? 1,
  };
}

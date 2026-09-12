import { redirect } from "next/navigation";
import { getCurrentProfile } from "./auth";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";
import { demoListings, demoProfiles } from "./demo-data";
import type { Listing, Profile } from "./types";

export interface AdminStats {
  users: number;
  pros: number;
  pros_to_verify: number;
  listings_pending: number;
  listings_active: number;
  listings_sold: number;
  reports_open: number;
  paid_subscriptions: number;
  visits_30d: number;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  reporter?: Pick<Profile, "id" | "display_name"> | null;
  listing_id: string | null;
  listing?: Pick<Listing, "id" | "slug" | "title" | "horse_name" | "status" | "seller_id"> | null;
  reason: string;
  details: string | null;
  status: string;
  resolution_note: string | null;
  created_at: string;
}

/** Accès admin : redirige vers la connexion ou l'accueil. En mode démo, tout est visible en lecture. */
export async function requireAdmin() {
  if (!isSupabaseConfigured()) return { demo: true, profile: demoProfiles[0] };
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?next=/admin");
  if (!profile.is_admin) redirect("/mon-compte");
  return { demo: false, profile };
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return { users: demoProfiles.length, pros: 2, pros_to_verify: 0, listings_pending: 1, listings_active: demoListings.length - 1, listings_sold: 0, reports_open: 1, paid_subscriptions: 0, visits_30d: 3 };
  }
  const supabase = (await createClient())!;
  const { data } = await supabase.from("ventes_admin_stats").select("*").single();
  return (data as AdminStats) ?? { users: 0, pros: 0, pros_to_verify: 0, listings_pending: 0, listings_active: 0, listings_sold: 0, reports_open: 0, paid_subscriptions: 0, visits_30d: 0 };
}

const SELLER = "seller:ventes_public_profiles!ventes_listings_seller_id_fkey(id, display_name, role, is_verified, city, region, avatar_url, slug, company_name)";

export async function getListingsForModeration(status: string): Promise<Listing[]> {
  if (!isSupabaseConfigured()) {
    const items = demoListings.map((l, i) => (i === 3 ? { ...l, status: "pending" as const } : l));
    return status === "all" ? items : items.filter((l) => l.status === status);
  }
  const supabase = (await createClient())!;
  let q = supabase.from("ventes_listings").select(`*, ${SELLER}`).order("updated_at", { ascending: false }).limit(100);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return (data ?? []) as unknown as Listing[];
}

export async function getReports(status: string): Promise<Report[]> {
  if (!isSupabaseConfigured()) {
    const l = demoListings[1];
    const r: Report = { id: "r1", reporter_id: "p-acheteur-1", reporter: { id: "p-acheteur-1", display_name: "Julien D." }, listing_id: l.id, listing: { id: l.id, slug: l.slug, title: l.title, horse_name: l.horse_name, status: l.status, seller_id: l.seller_id }, reason: "Photos ou informations trompeuses", details: "Les photos semblent provenir d'un autre site.", status: "open", resolution_note: null, created_at: new Date().toISOString() };
    return status === "open" || status === "all" ? [r] : [];
  }
  const supabase = (await createClient())!;
  let q = supabase.from("ventes_reports").select("*, reporter:ventes_public_profiles!ventes_reports_reporter_id_fkey(id, display_name), listing:ventes_listings(id, slug, title, horse_name, status, seller_id)").order("created_at", { ascending: false }).limit(100);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return (data ?? []) as unknown as Report[];
}

export async function getProfilesForAdmin(filter: "pros" | "to_verify" | "all" | "blocked"): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    if (filter === "all") return demoProfiles;
    if (filter === "blocked") return [];
    return demoProfiles.filter((p) => p.role === "eleveur" || p.role === "pro_depot");
  }
  const supabase = (await createClient())!;
  let q = supabase.from("ventes_profiles").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter === "pros") q = q.in("role", ["eleveur", "pro_depot"]);
  if (filter === "to_verify") q = q.in("role", ["eleveur", "pro_depot"]).eq("is_verified", false).not("siret", "is", null);
  if (filter === "blocked") q = q.eq("is_blocked", true);
  const { data } = await q;
  return (data ?? []) as Profile[];
}

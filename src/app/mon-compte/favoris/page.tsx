export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { ListingGrid } from "@/components/listings/ListingCard";
import { requireAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { demoListings } from "@/lib/demo-data";
import type { Listing } from "@/lib/types";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function FavorisPage() {
  const { profile, plan, userId } = await requireAccount();
  const supabase = await createClient();
  let listings: Listing[] = [];
  if (supabase) {
    const { data } = await supabase.from("favorites").select("listing:listings(*, seller:public_profiles!listings_seller_id_fkey(id, display_name, role, is_verified, city, region, avatar_url, slug, company_name))").eq("user_id", userId).order("created_at", { ascending: false });
    listings = ((data ?? []) as unknown as { listing: Listing | null }[]).map((r) => r.listing).filter((l): l is Listing => Boolean(l));
  } else listings = demoListings.slice(0, 2);
  return (
    <AccountShell profile={profile} plan={plan} title="Mes favoris">
      <ListingGrid listings={listings} empty="Aucun favori. Cliquez sur le cœur d'une annonce pour la retrouver ici." />
    </AccountShell>
  );
}

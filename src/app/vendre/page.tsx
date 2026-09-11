import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/ListingForm";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Déposer une annonce", description: "Publiez gratuitement une annonce de cheval à vendre, complète et sécurisée." };

export default async function VendrePage() {
  const user = await getCurrentUser();
  if (!user && isSupabaseConfigured()) redirect("/connexion?next=/vendre");
  const profile = await getCurrentProfile();
  const isPro = profile?.role === "eleveur" || profile?.role === "pro_depot";
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Déposer une annonce</h1>
      <p className="mt-1 text-sm text-muted">
        Publication gratuite. Une annonce complète (origines, niveau réel, papiers, photos, vidéo) obtient plus de demandes de visite.{" "}
        <Link href="/guides/particuliers-vendeurs" className="text-primary underline">
          Lire le guide du vendeur
        </Link>
        .
      </p>
      <div className="mt-6">
        <ListingForm userId={user?.id ?? "demo"} isPro={Boolean(isPro)} />
      </div>
    </div>
  );
}

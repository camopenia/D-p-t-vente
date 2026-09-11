import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe, MapPin, ShieldCheck } from "lucide-react";
import { getPublicProfile, getSellerListings } from "@/lib/listings";
import { ListingGrid } from "@/components/listings/ListingCard";
import { ROLES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicProfile(slug);
  return { title: p ? `${p.display_name} – ${ROLES[p.role].label}` : "Profil introuvable", description: p?.bio ?? undefined };
}

export default async function ProPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) notFound();
  const listings = await getSellerListings(profile.id);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="card flex flex-col gap-5 p-6 md:flex-row md:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-3xl text-white">{profile.display_name.slice(0, 1).toUpperCase()}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
          <p className="text-sm text-muted">
            {ROLES[profile.role].label}
            {profile.company_name ? ` · ${profile.company_name}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {profile.city ?? "—"}
              {profile.region ? ` · ${profile.region}` : ""}
            </span>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                <Globe className="h-4 w-4" /> Site web
              </a>
            )}
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 text-primary">
                <ShieldCheck className="h-4 w-4" /> Professionnel vérifié
              </span>
            )}
            <span>Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
          </div>
          {profile.bio && <p className="mt-4 whitespace-pre-line text-sm text-ink/90">{profile.bio}</p>}
        </div>
      </div>
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Chevaux proposés ({listings.length})</h2>
        <ListingGrid listings={listings} empty="Aucun cheval en vente actuellement." />
      </section>
    </div>
  );
}

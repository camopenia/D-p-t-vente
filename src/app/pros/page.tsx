export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { getProfessionals } from "@/lib/listings";
import { ROLES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Éleveurs et professionnels du dépôt-vente",
  description: "Annuaire des éleveurs et écuries de dépôt-vente présents sur Cavalons Ventes.",
};

export default async function ProsPage() {
  const pros = await getProfessionals();
  const eleveurs = pros.filter((p) => p.role === "eleveur");
  const depots = pros.filter((p) => p.role === "pro_depot");
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Éleveurs et professionnels du dépôt-vente</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">Les professionnels déclarent leur statut et leur SIRET. Le badge « vérifié » est attribué après contrôle par notre équipe.</p>
      <div className="mt-6 grid gap-4 rounded-2xl bg-primary-soft p-5 text-sm md:grid-cols-2">
        <div>
          <p className="font-semibold text-primary">Vous êtes éleveur ?</p>
          <p className="text-ink/80">Présentez vos produits avec origines, vidéos en liberté et papiers. Créez votre page vitrine.</p>
          <Link href="/inscription?role=eleveur" className="btn-primary mt-3 !py-1.5 text-xs">
            Créer mon espace éleveur
          </Link>
        </div>
        <div>
          <p className="font-semibold text-primary">Vous gérez des dépôts-ventes ?</p>
          <p className="text-ink/80">Publiez pour le compte de vos propriétaires avec un mandat clair, et centralisez les demandes de visite.</p>
          <Link href="/inscription?role=pro_depot" className="btn-primary mt-3 !py-1.5 text-xs">
            Créer mon espace pro
          </Link>
        </div>
      </div>
      <Section title="Éleveurs" items={eleveurs} />
      <Section title="Dépôts-ventes, courtiers et écuries de valorisation" items={depots} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: Awaited<ReturnType<typeof getProfessionals>> }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="card p-6 text-sm text-muted">Aucun profil pour le moment.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link key={p.id} href={`/pros/${p.slug ?? p.id}`} className="card p-5 transition hover:border-primary">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg text-white">{p.display_name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.display_name}</p>
                  <p className="text-xs text-muted">{ROLES[p.role].label}</p>
                </div>
              </div>
              {p.bio && <p className="mt-3 line-clamp-3 text-sm text-muted">{p.bio}</p>}
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {p.city ?? "—"}
                  {p.region ? ` · ${p.region}` : ""}
                </span>
                {p.is_verified && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AdminShell } from "@/components/layout/AdminShell";
import { getListingsForModeration, requireAdmin } from "@/lib/admin";
import { LISTING_STATUS, PAPERS, ROLES, formatPrice, ageLabel } from "@/lib/constants";
import { moderateListing } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Modération des annonces", robots: { index: false } };

const TABS = [["pending", "À valider"], ["active", "En ligne"], ["reserved", "Réservées"], ["sold", "Vendues"], ["draft", "Brouillons / refusées"], ["archived", "Archivées"], ["all", "Toutes"]] as const;

export default async function AdminAnnoncesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { demo } = await requireAdmin();
  const { status = "pending" } = await searchParams;
  const listings = await getListingsForModeration(status);
  return (
    <AdminShell title="Annonces" demo={demo}>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/admin/annonces?status=${k}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === k ? "bg-primary text-white" : "border border-line bg-white text-muted hover:text-primary"}`}>
            {l}
          </Link>
        ))}
      </div>
      {listings.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">Aucune annonce dans cette catégorie.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((l) => {
            const checks: [string, boolean][] = [
              ["SIRE renseigné", Boolean(l.sire_number) || l.papers === "onc"],
              ["Prix affiché", !l.price_hidden && l.price != null],
              ["Au moins 3 photos", l.photos.length >= 3],
              ["Vidéo", l.video_urls.length > 0],
              ["Description > 300 caractères", l.description.length > 300],
              ["Mots-clés suspects absents", !/à donner|western union|moneygram|agence de transport|frais de transport/i.test(l.description + " " + l.title)],
            ];
            return (
              <li key={l.id} className="card p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-primary-soft md:w-44">{l.photos[0] && <Image src={l.photos[0]} alt="" fill sizes="176px" className="object-cover" />}</div>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag-neutral">{LISTING_STATUS[l.status]}</span>
                      {l.featured && <span className="tag-pink">À la une</span>}
                      {l.is_depot_vente && <span className="tag-primary">Dépôt-vente</span>}
                    </div>
                    <Link href={`/chevaux/${l.slug}`} target="_blank" className="mt-1 block font-semibold hover:text-primary">
                      {l.title}
                    </Link>
                    <p className="text-muted">
                      {l.breed} · {ageLabel(l.birth_year)} · {formatPrice(l.price, { hidden: l.price_hidden })} · {l.city} ({l.region}) · {PAPERS[l.papers]}
                      {l.sire_number ? ` · SIRE ${l.sire_number}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      Vendeur : {l.seller?.display_name ?? l.seller_id} ({l.seller ? ROLES[l.seller.role].short : "?"}
                      {l.seller?.is_verified ? ", vérifié" : ""}) · créée le {new Date(l.created_at).toLocaleDateString("fr-FR")} · {l.views_count} vues
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {checks.map(([label, ok]) => (
                        <li key={label} className={ok ? "text-primary" : "text-red-600"}>
                          {ok ? "✓" : "✗"} {label}
                        </li>
                      ))}
                    </ul>
                    {l.moderation_note && <p className="mt-1 text-xs text-red-700">Dernier motif : {l.moderation_note}</p>}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted">Voir la description</summary>
                      <p className="mt-1 whitespace-pre-line rounded-lg bg-sand p-3 text-xs">{l.description}</p>
                    </details>
                  </div>
                </div>
                {!demo && (
                  <form action={moderateListing} className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center">
                    <input type="hidden" name="id" value={l.id} />
                    <input name="note" className="input flex-1" placeholder="Motif (visible par le vendeur en cas de refus / retrait)" />
                    {l.status !== "active" && l.status !== "sold" && (
                      <button name="action" value="approve" className="btn-primary !py-1.5 text-xs">
                        Valider
                      </button>
                    )}
                    {l.status === "pending" && (
                      <button name="action" value="reject" className="btn-neutral !py-1.5 text-xs">
                        Refuser
                      </button>
                    )}
                    {(l.status === "active" || l.status === "reserved") && (
                      <button name="action" value="archive" className="btn-destructive !py-1.5 text-xs">
                        Retirer
                      </button>
                    )}
                    <button name="action" value={l.featured ? "unfeature" : "feature"} className="btn-ghost !py-1.5 text-xs">
                      {l.featured ? "Retirer de la une" : "Mettre à la une"}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}

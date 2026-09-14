export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { getSellerListings } from "@/lib/listings";
import { LISTING_STATUS, formatPrice } from "@/lib/constants";
import { deleteListing, setListingStatus } from "@/app/actions/listings";

export const metadata: Metadata = { title: "Mes annonces" };

export default async function MesAnnoncesPage({ searchParams }: { searchParams: Promise<{ saved?: string; pending?: string }> }) {
  const { saved, pending } = await searchParams;
  const { profile, plan, userId } = await requireAccount();
  const listings = await getSellerListings(userId, true);
  return (
    <AccountShell profile={profile} plan={plan} title="Mes annonces">
      {saved && <p className="mb-4 rounded-lg bg-primary-soft p-3 text-sm text-primary">Annonce enregistrée.</p>}
      {pending && <p className="mb-4 rounded-lg bg-primary-soft p-3 text-sm text-primary">Annonce envoyée à la modération : elle sera en ligne après validation (sous 24 h ouvrées).</p>}
      <div className="mb-4 flex justify-end">
        <Link href="/vendre" className="btn-primary">
          Nouvelle annonce
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">Aucune annonce pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li key={l.id} className="card flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-primary-soft">{l.photos[0] && <Image src={l.photos[0]} alt="" fill sizes="112px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <Link href={`/chevaux/${l.slug}`} className="break-words font-medium hover:text-primary">
                  {l.title}
                </Link>
                <p className="text-xs text-muted">
                  {formatPrice(l.price, { hidden: l.price_hidden })} · {l.views_count} vues · <span className="tag-neutral">{LISTING_STATUS[l.status]}</span>
                </p>
                {l.moderation_note && <p className="mt-1 text-xs text-red-700">Modération : {l.moderation_note}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/mon-compte/annonces/${l.id}/modifier`} className="btn-neutral !py-1.5 text-xs">
                  Modifier
                </Link>
                <form action={setListingStatus} className="contents">
                  <input type="hidden" name="id" value={l.id} />
                  {l.status !== "active" && l.status !== "sold" && (
                    <button name="status" value="active" className="btn-primary !py-1.5 text-xs">
                      Publier
                    </button>
                  )}
                  {l.status === "active" && (
                    <button name="status" value="reserved" className="btn-neutral !py-1.5 text-xs">
                      Marquer réservé
                    </button>
                  )}
                  {(l.status === "active" || l.status === "reserved") && (
                    <button name="status" value="sold" className="btn-neutral !py-1.5 text-xs">
                      Marquer vendu
                    </button>
                  )}
                  {l.status !== "archived" && (
                    <button name="status" value="archived" className="btn-ghost !py-1.5 text-xs">
                      Archiver
                    </button>
                  )}
                </form>
                <form action={deleteListing}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="btn-destructive !py-1.5 text-xs">Supprimer</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}

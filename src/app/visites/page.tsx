export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { VISIT_STATUS } from "@/lib/constants";
import type { VisitRequest } from "@/lib/types";
import { answerVisit } from "@/app/actions/visits";

export const metadata: Metadata = { title: "Visites et essais" };

const SELECT = "*, listing:ventes_listings(id, slug, title, horse_name, photos, city), buyer:ventes_public_profiles!ventes_visit_requests_buyer_id_fkey(id, display_name, role), seller:ventes_public_profiles!ventes_visit_requests_seller_id_fkey(id, display_name, role)";

export default async function VisitesPage() {
  const { profile, plan, userId } = await requireAccount();
  const supabase = await createClient();
  let received: VisitRequest[] = [];
  let sent: VisitRequest[] = [];
  if (supabase) {
    const [{ data: r }, { data: s }] = await Promise.all([
      supabase.from("ventes_visit_requests").select(SELECT).eq("seller_id", userId).order("created_at", { ascending: false }),
      supabase.from("ventes_visit_requests").select(SELECT).eq("buyer_id", userId).order("created_at", { ascending: false }),
    ]);
    received = (r ?? []) as unknown as VisitRequest[];
    sent = (s ?? []) as unknown as VisitRequest[];
  }
  return (
    <AccountShell profile={profile} plan={plan} title="Visites et essais">
      <p className="mb-6 text-sm text-muted">
        Les demandes de visite et d&apos;essai sont gratuites pour tous. Rappel : le vendeur présente le cheval en premier, casque obligatoire pour l&apos;acheteur, jamais de sédation.{" "}
        <Link href="/guides/visite-et-essai" className="text-primary underline">
          Lire les règles de la visite
        </Link>
        .
      </p>
      <h2 className="mb-3 font-semibold">Demandes reçues ({received.length})</h2>
      {received.length === 0 ? (
        <p className="card mb-8 p-6 text-sm text-muted">Aucune demande reçue pour le moment.</p>
      ) : (
        <ul className="mb-8 space-y-3">
          {received.map((v) => (
            <li key={v.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {v.kind === "essai" ? "Essai monté" : "Visite"} · {v.listing ? <Link href={`/chevaux/${v.listing.slug}`} className="text-primary underline">{v.listing.horse_name}</Link> : "Annonce supprimée"}
                  </p>
                  <p className="text-xs text-muted">
                    De {v.buyer?.display_name ?? "—"} · le {new Date(v.created_at).toLocaleDateString("fr-FR")}
                    {v.preferred_date ? ` · date souhaitée : ${new Date(v.preferred_date).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                </div>
                <span className="tag-neutral">{VISIT_STATUS[v.status]}</span>
              </div>
              <p className="mt-2 whitespace-pre-line rounded-lg bg-sand p-3">{v.message}</p>
              {v.seller_reply && <p className="mt-2 text-xs text-muted">Votre réponse : {v.seller_reply}</p>}
              {v.status === "pending" && (
                <form action={answerVisit} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="id" value={v.id} />
                  <input name="reply" className="input flex-1" placeholder="Proposez un créneau, indiquez l'adresse, ce qu'il faut apporter…" />
                  <button name="status" value="accepted" className="btn-primary">
                    Accepter
                  </button>
                  <button name="status" value="declined" className="btn-neutral">
                    Refuser
                  </button>
                </form>
              )}
              {v.status === "accepted" && (
                <form action={answerVisit} className="mt-3">
                  <input type="hidden" name="id" value={v.id} />
                  <button name="status" value="done" className="btn-ghost text-xs">
                    Marquer comme effectuée
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      <h2 className="mb-3 font-semibold">Mes demandes envoyées ({sent.length})</h2>
      {sent.length === 0 ? (
        <p className="card p-6 text-sm text-muted">
          Vous n&apos;avez pas encore demandé de visite.{" "}
          <Link href="/chevaux" className="text-primary underline">
            Parcourir les annonces
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {sent.map((v) => (
            <li key={v.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {v.kind === "essai" ? "Essai monté" : "Visite"} · {v.listing ? <Link href={`/chevaux/${v.listing.slug}`} className="text-primary underline">{v.listing.horse_name}</Link> : "Annonce supprimée"}
                  </p>
                  <p className="text-xs text-muted">
                    Vendeur : {v.seller?.display_name ?? "—"} · envoyée le {new Date(v.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className={`tag ${v.status === "accepted" ? "bg-primary-soft text-primary" : v.status === "declined" ? "bg-red-50 text-red-700" : "bg-sand text-muted"}`}>{VISIT_STATUS[v.status]}</span>
              </div>
              {v.seller_reply && <p className="mt-2 rounded-lg bg-primary-soft p-3 text-primary">Réponse du vendeur : {v.seller_reply}</p>}
              {v.status === "pending" && (
                <form action={answerVisit} className="mt-2">
                  <input type="hidden" name="id" value={v.id} />
                  <button name="status" value="cancelled" className="btn-ghost text-xs">
                    Annuler ma demande
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}

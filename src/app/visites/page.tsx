export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, CreditCard } from "lucide-react";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { PERIODS, VISIT_RESPONSE_HOURS, VISIT_STATUS, formatSlot, type VisitSlot } from "@/lib/constants";
import type { VisitRequest } from "@/lib/types";
import { answerVisit } from "@/app/actions/visits";
import { expireVisitRequests } from "@/lib/visits";

export const metadata: Metadata = { title: "Visites et essais" };

const SELECT = "*, listing:ventes_listings(id, slug, title, horse_name, photos, city), buyer:ventes_public_profiles!ventes_visit_requests_buyer_id_fkey(id, display_name, role), seller:ventes_public_profiles!ventes_visit_requests_seller_id_fkey(id, display_name, role)";

const PAYMENT_LABEL: Record<VisitRequest["payment_status"], string> = { unpaid: "Frais à régler", paid: "Frais réglés", waived: "Frais offerts", refunded: "Frais remboursés" };

function deadline(v: VisitRequest) {
  if (v.status !== "pending" || !v.expires_at) return null;
  const ms = new Date(v.expires_at).getTime() - Date.now();
  if (ms <= 0) return "délai dépassé";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h} h ${m} min restantes` : `${m} min restantes`;
}

export default async function VisitesPage({ searchParams }: { searchParams: Promise<{ paye?: string; erreur?: string }> }) {
  const { paye, erreur } = await searchParams;
  const { profile, plan, userId } = await requireAccount();
  const supabase = await createClient();
  let received: VisitRequest[] = [];
  let sent: VisitRequest[] = [];
  if (supabase) {
    await expireVisitRequests();
    const [{ data: r }, { data: s }] = await Promise.all([
      supabase.from("ventes_visit_requests").select(SELECT).eq("seller_id", userId).order("created_at", { ascending: false }),
      supabase.from("ventes_visit_requests").select(SELECT).eq("buyer_id", userId).order("created_at", { ascending: false }),
    ]);
    received = (r ?? []) as unknown as VisitRequest[];
    sent = (s ?? []) as unknown as VisitRequest[];
  }
  return (
    <AccountShell profile={profile} plan={plan} title="Visites et essais">
      {paye && <p className="mb-4 rounded-lg bg-primary-soft p-3 text-sm text-primary">Merci, votre paiement est en cours de confirmation (quelques secondes). Le vendeur a {VISIT_RESPONSE_HOURS} h pour vous répondre.</p>}
      {erreur && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Le paiement est indisponible pour le moment.</p>}
      <p className="mb-6 text-sm text-muted">
        Chaque demande coûte 10 € de frais de plateforme, remboursés si le vendeur refuse ou ne répond pas sous {VISIT_RESPONSE_HOURS} h. Rappel : le vendeur présente le cheval en premier, casque obligatoire pour l&apos;acheteur, jamais de sédation.{" "}
        <Link href="/guides/visite-et-essai" className="text-primary underline">
          Lire les règles de la visite
        </Link>
        .
      </p>

      <h2 className="mb-3 font-semibold">Demandes reçues ({received.length})</h2>
      {received.length === 0 ? (
        <p className="card mb-8 p-6 text-sm text-muted">Aucune demande reçue pour le moment. Elles apparaissent ici une fois les frais réglés par l&apos;acheteur.</p>
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
                    De {v.buyer?.display_name ?? "—"} · reçue le {new Date(v.paid_at ?? v.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`tag ${v.status === "accepted" ? "bg-primary-soft text-primary" : v.status === "declined" || v.status === "expired" ? "bg-red-50 text-red-700" : "bg-sand text-muted"}`}>{VISIT_STATUS[v.status]}</span>
                  {deadline(v) && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#8a2f40]">
                      <Clock className="h-3.5 w-3.5" /> {deadline(v)}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line rounded-lg bg-sand p-3">{v.message}</p>
              {v.status === "accepted" && v.chosen_slot && <p className="mt-2 text-primary">Créneau retenu : {formatSlot(v.chosen_slot)}</p>}
              {v.seller_reply && <p className="mt-2 text-xs text-muted">Votre réponse : {v.seller_reply}</p>}
              {v.status === "pending" && (
                <form action={answerVisit} className="mt-3 space-y-2 border-t border-line pt-3">
                  <input type="hidden" name="id" value={v.id} />
                  <fieldset>
                    <legend className="text-xs font-medium">Créneaux proposés par l&apos;acheteur : choisissez-en un pour accepter</legend>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {((v.slots ?? []) as VisitSlot[]).map((s) => (
                        <label key={s.date + s.period} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white">
                          <input type="radio" name="chosenSlot" value={JSON.stringify(s)} className="sr-only" />
                          {new Date(s.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {PERIODS[s.period].toLowerCase()}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input name="reply" className="input flex-1" placeholder="Adresse, consignes, ce qu'il faut apporter…" />
                    <button name="status" value="accepted" className="btn-primary">
                      Accepter avec ce créneau
                    </button>
                    <button name="status" value="declined" className="btn-neutral">
                      Refuser (remboursé)
                    </button>
                  </div>
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
                    Vendeur : {v.seller?.display_name ?? "—"} · envoyée le {new Date(v.created_at).toLocaleDateString("fr-FR")} · {PAYMENT_LABEL[v.payment_status]}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`tag ${v.status === "accepted" ? "bg-primary-soft text-primary" : v.status === "declined" || v.status === "expired" ? "bg-red-50 text-red-700" : "bg-sand text-muted"}`}>{v.payment_status === "unpaid" ? "Frais à régler" : VISIT_STATUS[v.status]}</span>
                  {v.payment_status !== "unpaid" && deadline(v) && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5" /> réponse attendue, {deadline(v)}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">Créneaux proposés : {((v.slots ?? []) as VisitSlot[]).map((s) => formatSlot(s)).join(" · ")}</p>
              {v.status === "accepted" && v.chosen_slot && <p className="mt-2 rounded-lg bg-primary-soft p-3 text-primary">Visite confirmée : {formatSlot(v.chosen_slot)}</p>}
              {v.seller_reply && <p className="mt-2 rounded-lg bg-sand p-3">Message du vendeur : {v.seller_reply}</p>}
              {v.payment_status === "unpaid" && (
                <Link href={`/visites/payer/${v.id}`} className="btn-primary mt-3 !py-1.5 text-xs">
                  <CreditCard className="h-3.5 w-3.5" /> Régler les frais pour transmettre la demande
                </Link>
              )}
              {v.status === "pending" && v.payment_status !== "unpaid" && (
                <form action={answerVisit} className="mt-2">
                  <input type="hidden" name="id" value={v.id} />
                  <button name="status" value="cancelled" className="btn-ghost text-xs">
                    Annuler ma demande (frais non remboursés)
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

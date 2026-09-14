import "server-only";
import { createClient, createServiceClient } from "./supabase/server";
import { getStripe } from "./stripe";
import type { VisitRequest } from "./types";

/**
 * Passe en « expirée » les demandes sans réponse du vendeur après 48 h et rembourse les frais.
 * Appelé au chargement de l'espace visites. Idempotent.
 */
export async function expireVisitRequests(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;
  const { data } = await supabase.rpc("ventes_expire_visit_requests");
  const expired = (data ?? []) as VisitRequest[];
  for (const v of expired) await refundVisitFee(v);
  return expired.length;
}

/** Rembourse les frais de plateforme d'une demande (refus ou absence de réponse). */
export async function refundVisitFee(v: Pick<VisitRequest, "id" | "payment_status" | "stripe_payment_intent_id">) {
  if (v.payment_status !== "paid" || !v.stripe_payment_intent_id) return;
  const stripe = getStripe();
  const service = createServiceClient();
  if (!stripe || !service) return;
  try {
    await stripe.refunds.create({ payment_intent: v.stripe_payment_intent_id, reason: "requested_by_customer" });
    await service.from("ventes_visit_requests").update({ payment_status: "refunded" }).eq("id", v.id);
  } catch (err) {
    console.error("Remboursement visite impossible :", (err as Error).message);
  }
}

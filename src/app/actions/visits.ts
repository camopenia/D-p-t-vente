"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { getStripe } from "@/lib/stripe";
import { refundVisitFee } from "@/lib/visits";
import { VISIT_FEE_CENTS, VISIT_RESPONSE_HOURS, upcomingSlots, type VisitAvailability, type VisitSlot } from "@/lib/constants";

const slotSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), period: z.enum(["matin", "apres_midi", "soiree"]) });

const schema = z.object({
  listingId: z.string().min(1),
  sellerId: z.string().min(1),
  kind: z.enum(["visite", "essai"]),
  slots: z.array(slotSchema).min(1, "Choisissez au moins un créneau.").max(6, "Six créneaux maximum."),
  message: z.string().min(20, "Décrivez votre projet en quelques phrases (20 caractères minimum).").max(2000),
});

export type ActionState = { ok: boolean; message: string } | null;

export async function requestVisit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration : configurez Supabase pour envoyer des demandes." };
  let slots: unknown = [];
  try {
    slots = JSON.parse(String(formData.get("slots") ?? "[]"));
  } catch {
    slots = [];
  }
  const parsed = schema.safeParse({
    listingId: formData.get("listingId"),
    sellerId: formData.get("sellerId"),
    kind: formData.get("kind") ?? "visite",
    slots,
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Connectez-vous pour demander une visite." };
  if (user.id === parsed.data.sellerId) return { ok: false, message: "Vous ne pouvez pas demander une visite de votre propre annonce." };

  // Les créneaux doivent correspondre aux disponibilités du vendeur
  const { data: listing } = await supabase.from("ventes_listings").select("id, status, visit_available, visit_availability, horse_name").eq("id", parsed.data.listingId).maybeSingle();
  if (!listing || listing.status !== "active" || !listing.visit_available) return { ok: false, message: "Cette annonce n'accepte pas de visite actuellement." };
  const allowed = new Set(upcomingSlots((listing.visit_availability ?? {}) as VisitAvailability).map((s) => `${s.date}|${s.period}`));
  const chosen: VisitSlot[] = parsed.data.slots.filter((s) => allowed.has(`${s.date}|${s.period}`));
  if (chosen.length === 0) return { ok: false, message: "Les créneaux choisis ne correspondent plus aux disponibilités du vendeur. Rechargez la page." };

  const stripeReady = isStripeConfigured();
  const expiresAt = new Date(Date.now() + VISIT_RESPONSE_HOURS * 3600 * 1000).toISOString();
  const { data: created, error } = await supabase
    .from("ventes_visit_requests")
    .insert({
      listing_id: parsed.data.listingId,
      seller_id: parsed.data.sellerId,
      buyer_id: user.id,
      kind: parsed.data.kind,
      slots: chosen,
      message: parsed.data.message,
      fee_cents: VISIT_FEE_CENTS,
      // Sans Stripe configuré, les frais sont dispensés pour permettre les tests
      payment_status: stripeReady ? "unpaid" : "waived",
      expires_at: stripeReady ? null : expiresAt, // le délai de 48 h démarre au paiement
    })
    .select("id")
    .single();
  if (error || !created) return { ok: false, message: "Impossible d'envoyer la demande : " + (error?.message ?? "erreur inconnue") };
  revalidatePath("/visites");
  if (!stripeReady) return { ok: true, message: "Demande envoyée ! Le vendeur a 48 h pour répondre et choisir un créneau parmi ceux que vous avez proposés. Suivez-la dans « Visites & essais »." };
  redirect(`/visites/payer/${created.id}`);
}

/** Crée la session de paiement Stripe (10 €) pour une demande et redirige vers Stripe. */
export async function payVisit(formData: FormData) {
  const id = String(formData.get("id"));
  const stripe = getStripe();
  const supabase = await createClient();
  if (!stripe || !supabase) redirect("/visites?erreur=paiement-indisponible");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/visites");
  const { data: v } = await supabase.from("ventes_visit_requests").select("id, buyer_id, payment_status, fee_cents, kind, listing:ventes_listings(horse_name)").eq("id", id).maybeSingle();
  if (!v || v.buyer_id !== user.id) redirect("/visites");
  if (v.payment_status !== "unpaid") redirect("/visites");
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const horse = (v.listing as unknown as { horse_name: string } | null)?.horse_name ?? "cheval";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: v.fee_cents, product_data: { name: `Demande ${v.kind === "essai" ? "d'essai" : "de visite"} – ${horse}`, description: "Frais de plateforme Cavalons Ventes. Remboursés si le vendeur refuse ou ne répond pas sous 48 h." } } }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { type: "visit", visit_request_id: v.id, user_id: user.id },
    payment_intent_data: { metadata: { type: "visit", visit_request_id: v.id } },
    locale: "fr",
    success_url: `${origin}/visites?paye=1`,
    cancel_url: `${origin}/visites/payer/${v.id}?annule=1`,
  });
  await supabase.from("ventes_visit_requests").update({ stripe_checkout_session_id: session.id }).eq("id", v.id);
  redirect(session.url!);
}

export async function answerVisit(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const reply = String(formData.get("reply") ?? "").trim();
  if (!["accepted", "declined", "done", "cancelled"].includes(status)) return;
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: v } = await supabase.from("ventes_visit_requests").select("*").eq("id", id).maybeSingle();
  if (!v) return;
  const patch: Record<string, unknown> = { status, seller_reply: reply || null };

  if (status === "accepted") {
    if (v.seller_id !== user.id || v.status !== "pending") return;
    let chosen: VisitSlot | null = null;
    try {
      chosen = JSON.parse(String(formData.get("chosenSlot") ?? "null"));
    } catch {
      chosen = null;
    }
    const valid = (v.slots as VisitSlot[]).some((s) => chosen && s.date === chosen.date && s.period === chosen.period);
    if (!valid) return; // le vendeur doit retenir un des créneaux proposés
    patch.chosen_slot = chosen;
  }
  if (status === "declined") {
    if (v.seller_id !== user.id || v.status !== "pending") return;
  }
  if (status === "cancelled") {
    if (v.buyer_id !== user.id || v.status !== "pending") return;
  }
  if (status === "done" && v.seller_id !== user.id && v.buyer_id !== user.id) return;

  const { error } = await supabase.from("ventes_visit_requests").update(patch).eq("id", id);
  if (error) return;
  // Frais remboursés si le vendeur refuse (l'acheteur qui annule n'est pas remboursé)
  if (status === "declined") await refundVisitFee(v);
  revalidatePath("/visites");
  revalidatePath("/mon-compte");
}

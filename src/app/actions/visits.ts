"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const schema = z.object({
  listingId: z.string().min(1),
  sellerId: z.string().min(1),
  kind: z.enum(["visite", "essai"]),
  preferredDate: z.string().optional(),
  message: z.string().min(20, "Décrivez votre projet en quelques phrases (20 caractères minimum).").max(2000),
});

export type ActionState = { ok: boolean; message: string } | null;

export async function requestVisit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration : configurez Supabase pour envoyer des demandes." };
  const parsed = schema.safeParse({
    listingId: formData.get("listingId"),
    sellerId: formData.get("sellerId"),
    kind: formData.get("kind") ?? "visite",
    preferredDate: formData.get("preferredDate") || undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Connectez-vous pour demander une visite." };
  if (user.id === parsed.data.sellerId) return { ok: false, message: "Vous ne pouvez pas demander une visite de votre propre annonce." };
  const { error } = await supabase.from("ventes_visit_requests").insert({
    listing_id: parsed.data.listingId,
    seller_id: parsed.data.sellerId,
    buyer_id: user.id,
    kind: parsed.data.kind,
    preferred_date: parsed.data.preferredDate ?? null,
    message: parsed.data.message,
  });
  if (error) return { ok: false, message: "Impossible d'envoyer la demande : " + error.message };
  revalidatePath("/visites");
  return { ok: true, message: "Demande envoyée ! Le vendeur vous répondra depuis son espace. Retrouvez vos demandes dans « Mes visites »." };
}

export async function answerVisit(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const reply = String(formData.get("reply") ?? "");
  if (!["accepted", "declined", "done", "cancelled"].includes(status)) return;
  const supabase = (await createClient())!;
  await supabase.from("ventes_visit_requests").update({ status, seller_reply: reply || null }).eq("id", id);
  revalidatePath("/visites");
  revalidatePath("/mon-compte");
}

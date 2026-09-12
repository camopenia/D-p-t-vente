"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { canContact, getCurrentSubscription, planOf } from "@/lib/auth";
import type { ActionState } from "./visits";

export async function startConversation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration : configurez Supabase pour activer la messagerie." };
  const listingId = String(formData.get("listingId"));
  const sellerId = String(formData.get("sellerId"));
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 10) return { ok: false, message: "Votre message est trop court." };
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Connectez-vous pour envoyer un message." };
  const plan = planOf(await getCurrentSubscription());
  if (!canContact(plan)) return { ok: false, message: "La messagerie est réservée aux abonnés Contact. Les demandes de visite restent gratuites." };

  let conversationId: string | null = null;
  const { data: existing } = await supabase.from("ventes_conversations").select("id").eq("listing_id", listingId).eq("buyer_id", user.id).eq("seller_id", sellerId).maybeSingle();
  if (existing) conversationId = existing.id;
  else {
    const { data, error } = await supabase.from("ventes_conversations").insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId }).select("id").single();
    if (error) return { ok: false, message: error.message.includes("policy") ? "Abonnement Contact requis pour écrire aux vendeurs." : error.message };
    conversationId = data.id;
  }
  const { error: mErr } = await supabase.from("ventes_messages").insert({ conversation_id: conversationId, sender_id: user.id, body });
  if (mErr) return { ok: false, message: mErr.message };
  redirect(`/messages/${conversationId}`);
}

export async function sendMessage(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const conversationId = String(formData.get("conversationId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("ventes_messages").insert({ conversation_id: conversationId, sender_id: user.id, body });
  revalidatePath(`/messages/${conversationId}`);
}

export async function revealPhone(listingId: string): Promise<{ phone?: string; error?: string }> {
  if (!isSupabaseConfigured()) return { error: "demo" };
  const supabase = (await createClient())!;
  const { data, error } = await supabase.rpc("ventes_reveal_phone", { p_listing: listingId });
  if (error) {
    if (error.message.includes("SUBSCRIPTION_REQUIRED")) return { error: "subscription" };
    if (error.message.includes("AUTH_REQUIRED")) return { error: "auth" };
    return { error: error.message };
  }
  return { phone: (data as string) ?? undefined };
}

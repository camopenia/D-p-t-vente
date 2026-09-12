import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Profile, Subscription } from "./types";
import type { PlanId } from "./constants";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  const { data } = await supabase.from("ventes_profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as Profile;
  // Compte Cavalons existant (demi-pension) sans profil Ventes : on le crée à la première visite.
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const displayName = meta.display_name || [meta.first_name, meta.last_name].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Membre";
  const { data: created } = await supabase
    .from("ventes_profiles")
    .insert({ id: user.id, display_name: displayName, role: meta.role && ["acheteur", "particulier", "eleveur", "pro_depot"].includes(meta.role) ? meta.role : "acheteur", email: user.email ?? null })
    .select("*")
    .maybeSingle();
  if (created) await supabase.from("ventes_subscriptions").insert({ user_id: user.id, plan: "free", status: "active" });
  return (created as Profile) ?? null;
});

export const getCurrentSubscription = cache(async (): Promise<Subscription | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  const { data } = await supabase
    .from("ventes_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Subscription) ?? null;
});

export function planOf(sub: Subscription | null): PlanId {
  if (!sub) return "free";
  if (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") return sub.plan;
  return "free";
}

/** La messagerie et le téléphone sont réservés aux abonnés Contact / Pro. */
export function canContact(plan: PlanId) {
  return plan === "contact" || plan === "pro";
}

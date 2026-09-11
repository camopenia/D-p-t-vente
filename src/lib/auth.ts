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
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? null;
});

export const getCurrentSubscription = cache(async (): Promise<Subscription | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  const { data } = await supabase
    .from("subscriptions")
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

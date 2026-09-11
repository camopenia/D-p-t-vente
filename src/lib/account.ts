import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentSubscription, getCurrentUser, planOf } from "./auth";
import { isSupabaseConfigured } from "./supabase/config";
import { demoProfiles } from "./demo-data";
import type { Profile } from "./types";

/** Contexte commun des pages « Mon espace ». En mode démo, on simule le compte éleveur. */
export async function requireAccount() {
  const user = await getCurrentUser();
  if (!user && isSupabaseConfigured()) redirect("/connexion?next=/mon-compte");
  const profile: Profile | null = isSupabaseConfigured() ? await getCurrentProfile() : demoProfiles[0];
  const plan = isSupabaseConfigured() ? planOf(await getCurrentSubscription()) : "free";
  return { user, profile, plan, userId: user?.id ?? profile?.id ?? "demo" };
}

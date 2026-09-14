"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActionState } from "./visits";
import { siteUrl } from "@/lib/site";

const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/mon-compte");

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration : configurez Supabase pour activer les comptes." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = (await createClient())!;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "Email ou mot de passe incorrect." };
  redirect(safeNext(formData.get("next")));
}

const signUpSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "8 caractères minimum."),
  displayName: z.string().min(2, "Indiquez votre nom ou celui de votre structure.").max(80),
  role: z.enum(["acheteur", "particulier", "eleveur", "pro_depot"]),
  charter: z.literal("on", { message: "Vous devez accepter le pacte de bonne conduite." }),
});

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration : configurez Supabase pour activer les comptes." };
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    role: formData.get("role"),
    charter: formData.get("charter"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = (await createClient())!;
  const origin = (await headers()).get("origin") ?? siteUrl();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/mon-compte`,
      data: { display_name: parsed.data.displayName, role: parsed.data.role, charter_accepted: "true" },
    },
  });
  if (error) return { ok: false, message: error.message };
  if (data.session) redirect("/mon-compte");
  return { ok: true, message: "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse." };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration." };
  const email = String(formData.get("email") ?? "").trim();
  const supabase = (await createClient())!;
  const origin = (await headers()).get("origin") ?? "";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/mon-compte/profil` });
  return { ok: true, message: "Si un compte existe pour cette adresse, un email de réinitialisation a été envoyé." };
}

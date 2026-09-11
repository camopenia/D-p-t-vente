"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { slugify } from "@/lib/constants";
import type { ActionState } from "./visits";

const schema = z.object({
  display_name: z.string().min(2).max(80),
  role: z.enum(["acheteur", "particulier", "eleveur", "pro_depot"]),
  phone: z.string().max(30).optional(),
  bio: z.string().max(2000).optional(),
  city: z.string().max(80).optional(),
  postal_code: z.string().regex(/^[0-9]{5}$/).optional().or(z.literal("")),
  region: z.string().max(80).optional(),
  siret: z.string().max(20).optional(),
  company_name: z.string().max(120).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration." };
  const obj = Object.fromEntries(Array.from(formData.entries()).map(([k, v]) => [k, String(v).trim()]));
  const parsed = schema.safeParse(obj);
  if (!parsed.success) return { ok: false, message: `${parsed.error.issues[0].path.join(".")} : ${parsed.error.issues[0].message}` };
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Non connecté." };
  const d = parsed.data;
  const isPro = d.role === "eleveur" || d.role === "pro_depot";
  if (isPro && d.siret && !/^[0-9]{14}$/.test(d.siret.replace(/\s/g, ""))) return { ok: false, message: "SIRET : 14 chiffres attendus." };
  const update = {
    ...d,
    siret: isPro ? d.siret?.replace(/\s/g, "") || null : null,
    company_name: isPro ? d.company_name || null : null,
    website: d.website || null,
    postal_code: d.postal_code || null,
    slug: isPro ? `${slugify(d.company_name || d.display_name)}-${user.id.slice(0, 6)}` : null,
  };
  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/mon-compte/profil");
  revalidatePath("/pros");
  return { ok: true, message: "Profil enregistré." };
}

"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { slugify } from "@/lib/constants";
import { friendlyDbError } from "@/lib/supabase/fetch";
import type { ActionState } from "./visits";

const year = new Date().getFullYear();

const listingSchema = z.object({
  id: z.string().optional(),
  horse_name: z.string().min(2, "Le nom du cheval est requis.").max(60),
  title: z.string().min(15, "Le titre doit être explicite (15 caractères minimum).").max(120),
  breed: z.string().min(2, "Indiquez la race."),
  sex: z.enum(["jument", "hongre", "entier", "pouliche", "poulain"]),
  birth_year: z.coerce.number().int().min(1980).max(year, "Année de naissance invalide."),
  height_cm: z.coerce.number().int().min(60).max(220).optional().or(z.literal(NaN).transform(() => undefined)),
  color: z.string().optional(),
  disciplines: z.array(z.string()).min(1, "Choisissez au moins une discipline."),
  level: z.enum(["poulain", "debourre", "club", "amateur", "pro", "retraite"]),
  description: z.string().min(120, "Décrivez le cheval de façon complète (120 caractères minimum) : travail actuel, caractère, mode de vie, raison de la vente."),
  temperament: z.string().optional(),
  sire_number: z
    .string()
    .transform((s) => s.replace(/\s+/g, "").toUpperCase())
    .refine((s) => s.length === 0 || /^[0-9]{8}[0-9A-Z]{0,7}$/.test(s), "Numéro SIRE invalide (8 chiffres + clé)."),
  papers: z.enum(["sire_full", "sire_only", "oc", "onc", "foreign"]),
  studbook_approved: z.boolean(),
  sire_name: z.string().optional(),
  dam_name: z.string().optional(),
  dam_sire_name: z.string().optional(),
  price: z.coerce.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
  price_hidden: z.boolean(),
  price_negotiable: z.boolean(),
  vat_included: z.boolean(),
  city: z.string().min(2, "Indiquez la commune où se trouve le cheval."),
  postal_code: z.string().regex(/^[0-9]{5}$/, "Code postal à 5 chiffres.").optional().or(z.literal("")),
  region: z.string().min(2, "Indiquez la région."),
  photos: z.array(z.string().url()).max(12),
  video_urls: z.array(z.string().url("Lien vidéo invalide.")).max(5),
  vet_check_available: z.boolean(),
  xrays_available: z.boolean(),
  trial_available: z.boolean(),
  visit_available: z.boolean(),
  visit_availability: z.record(z.string().regex(/^[1-7]$/), z.array(z.enum(["matin", "apres_midi", "soiree"]))).default({}),
  is_depot_vente: z.boolean(),
  owner_name: z.string().optional(),
  competition_results: z.string().optional(),
  health_notes: z.string().optional(),
  known_vices: z.string().optional(),
  status: z.enum(["draft", "active"]),
  honesty: z.literal(true, { message: "Vous devez certifier l'exactitude des informations." }),
});

export type ListingInput = z.input<typeof listingSchema>;

export async function saveListing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Mode démonstration : configurez Supabase pour publier des annonces." };
  const raw = JSON.parse(String(formData.get("payload") ?? "{}"));
  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  if (!d.price_hidden && d.price == null) return { ok: false, message: "Indiquez un prix ou cochez « prix sur demande »." };
  if (d.status === "active" && d.photos.length < 1) return { ok: false, message: "Ajoutez au moins une photo pour publier (3 recommandées : profil, 3/4, mouvement)." };
  if (d.status === "active" && d.papers !== "onc" && !d.sire_number) return { ok: false, message: "Le numéro SIRE est requis pour publier (sauf ONC)." };
  if (d.is_depot_vente && !d.owner_name) return { ok: false, message: "Précisez pour le compte de qui le cheval est vendu (nom ou « propriétaire particulier »)." };
  const hasAvailability = Object.values(d.visit_availability).some((p) => p.length > 0);
  if (d.status === "active" && d.visit_available && !hasAvailability) return { ok: false, message: "Indiquez au moins un créneau de disponibilité pour les visites (ou décochez « Visite sur rendez-vous »)." };

  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Connectez-vous pour publier." };

  const { honesty: _h, id, ...rest } = d;
  void _h;
  const row = {
    ...rest,
    height_cm: rest.height_cm ?? null,
    price: rest.price_hidden ? null : (rest.price ?? null),
    postal_code: rest.postal_code || null,
    sire_number: rest.sire_number || null,
    owner_name: rest.is_depot_vente ? rest.owner_name || null : null,
    seller_id: user.id,
  };

  // Modération a priori : une publication passe d'abord en attente de validation,
  // sauf si l'annonce est déjà en ligne (simple mise à jour).
  let status: string = row.status;
  if (status === "active") {
    const { data: prev } = id ? await supabase.from("ventes_listings").select("status").eq("id", id).maybeSingle() : { data: null };
    if (prev?.status !== "active" && prev?.status !== "reserved") status = "pending";
  }
  const rowWithStatus = { ...row, status };

  if (id) {
    const { error } = await supabase.from("ventes_listings").update(rowWithStatus).eq("id", id).eq("seller_id", user.id);
    if (error) return { ok: false, message: friendlyDbError(error.message) };
    revalidatePath("/chevaux");
    revalidatePath("/mon-compte");
    redirect("/mon-compte/annonces?saved=1");
  }
  const slug = `${slugify(`${d.horse_name} ${d.breed} ${year - d.birth_year} ans`)}-${Math.random().toString(36).slice(2, 7)}`;
  const { error } = await supabase.from("ventes_listings").insert({ ...rowWithStatus, slug });
  if (error) {
    // Si l'API a expiré (504) alors que l'insertion a abouti côté base, on vérifie avant de renvoyer une erreur.
    const { data: check } = await supabase.from("ventes_listings").select("id").eq("slug", slug).maybeSingle();
    if (!check) return { ok: false, message: friendlyDbError(error.message) };
  }
  revalidatePath("/chevaux");
  redirect(status === "pending" ? "/mon-compte/annonces?pending=1" : "/mon-compte/annonces?saved=1");
}

export async function setListingStatus(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["draft", "active", "reserved", "sold", "archived"].includes(status)) return;
  const supabase = (await createClient())!;
  const { data: prev } = await supabase.from("ventes_listings").select("status").eq("id", id).maybeSingle();
  const next = status === "active" && prev?.status !== "reserved" ? "pending" : status;
  await supabase.from("ventes_listings").update({ status: next }).eq("id", id);
  revalidatePath("/mon-compte/annonces");
  revalidatePath("/chevaux");
}

export async function deleteListing(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const supabase = (await createClient())!;
  await supabase.from("ventes_listings").delete().eq("id", String(formData.get("id")));
  revalidatePath("/mon-compte/annonces");
  revalidatePath("/chevaux");
}

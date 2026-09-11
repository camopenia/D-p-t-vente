"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function toggleFavorite(listingId: string, slug: string) {
  if (!isSupabaseConfigured()) return { ok: false };
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, auth: true };
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle();
  if (data) await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
  else await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
  revalidatePath(`/chevaux/${slug}`);
  revalidatePath("/mon-compte");
  return { ok: true, favorite: !data };
}

export async function reportListing(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("reports").insert({
    reporter_id: user.id,
    listing_id: String(formData.get("listingId")),
    reason: String(formData.get("reason")),
    details: String(formData.get("details") ?? "") || null,
  });
}

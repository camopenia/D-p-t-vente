"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentProfile } from "@/lib/auth";

async function requireAdmin() {
  if (!isSupabaseConfigured()) return null;
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) throw new Error("Accès réservé aux administrateurs.");
  const supabase = (await createClient())!;
  return { supabase, adminId: profile.id };
}

async function log(ctx: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>, target_type: string, target_id: string, action: string, note?: string) {
  await ctx.supabase.from("moderation_log").insert({ admin_id: ctx.adminId, target_type, target_id, action, note: note || null });
}

export async function moderateListing(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const note = String(formData.get("note") ?? "").trim();
  const patch: Record<string, unknown> = {};
  if (action === "approve") Object.assign(patch, { status: "active", moderation_note: null });
  else if (action === "reject") Object.assign(patch, { status: "draft", moderation_note: note || "Annonce non conforme au pacte de bonne conduite." });
  else if (action === "archive") Object.assign(patch, { status: "archived", moderation_note: note || null });
  else if (action === "feature") Object.assign(patch, { featured: true });
  else if (action === "unfeature") Object.assign(patch, { featured: false });
  else return;
  await ctx.supabase.from("listings").update(patch).eq("id", id);
  await log(ctx, "listing", id, action, note);
  revalidatePath("/admin");
  revalidatePath("/admin/annonces");
  revalidatePath("/chevaux");
}

export async function resolveReport(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const note = String(formData.get("note") ?? "").trim();
  const listingId = String(formData.get("listingId") ?? "");
  if (action === "archive_listing" && listingId) {
    await ctx.supabase.from("listings").update({ status: "archived", moderation_note: note || "Retirée suite à un signalement." }).eq("id", listingId);
    await log(ctx, "listing", listingId, "archive", note);
  }
  await ctx.supabase.from("reports").update({ status: action === "dismiss" ? "dismissed" : "resolved", resolved_by: ctx.adminId, resolved_at: new Date().toISOString(), resolution_note: note || null }).eq("id", id);
  await log(ctx, "report", id, action, note);
  revalidatePath("/admin");
  revalidatePath("/admin/signalements");
}

export async function moderateProfile(formData: FormData) {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const note = String(formData.get("note") ?? "").trim();
  const patch: Record<string, unknown> = {};
  if (action === "verify") Object.assign(patch, { is_verified: true, verification_note: note || null });
  else if (action === "unverify") Object.assign(patch, { is_verified: false, verification_note: note || null });
  else if (action === "block") Object.assign(patch, { is_blocked: true, verification_note: note || null });
  else if (action === "unblock") Object.assign(patch, { is_blocked: false });
  else if (action === "make_admin") Object.assign(patch, { is_admin: true });
  else if (action === "remove_admin") Object.assign(patch, { is_admin: false });
  else return;
  if (action === "remove_admin" && id === ctx.adminId) return;
  await ctx.supabase.from("profiles").update(patch).eq("id", id);
  if (action === "block") await ctx.supabase.from("listings").update({ status: "archived", moderation_note: "Compte suspendu." }).eq("seller_id", id).in("status", ["active", "pending", "reserved"]);
  await log(ctx, "profile", id, action, note);
  revalidatePath("/admin");
  revalidatePath("/admin/professionnels");
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/pros");
}

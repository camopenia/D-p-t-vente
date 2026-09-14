import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard } from "lucide-react";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/supabase/config";
import { payVisit } from "@/app/actions/visits";
import { PERIODS, VISIT_RESPONSE_HOURS, type VisitSlot } from "@/lib/constants";

export const metadata: Metadata = { title: "Régler les frais de visite", robots: { index: false } };

export default async function PayerVisitePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ annule?: string }> }) {
  const { id } = await params;
  const { annule } = await searchParams;
  const { profile, plan, userId } = await requireAccount();
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: v } = await supabase.from("ventes_visit_requests").select("*, listing:ventes_listings(id, slug, title, horse_name, city)").eq("id", id).maybeSingle();
  if (!v || v.buyer_id !== userId) notFound();
  if (v.payment_status !== "unpaid") redirect("/visites?paye=1");
  const listing = v.listing as unknown as { slug: string; title: string; horse_name: string; city: string } | null;
  const fee = (v.fee_cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const slots = (v.slots ?? []) as VisitSlot[];
  return (
    <AccountShell profile={profile} plan={plan} title="Régler les frais de visite">
      {annule && <p className="mb-4 rounded-lg bg-sand p-3 text-sm text-muted">Paiement annulé. Votre demande est conservée ; le vendeur ne la verra qu&apos;une fois les frais réglés.</p>}
      <div className="card max-w-xl p-6">
        <p className="text-sm text-muted">{v.kind === "essai" ? "Essai monté" : "Visite"} · {listing?.title ?? "Annonce"}</p>
        <ul className="mt-3 space-y-1 text-sm">
          {slots.map((s) => (
            <li key={s.date + s.period}>• {new Date(s.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {PERIODS[s.period].toLowerCase()}</li>
          ))}
        </ul>
        <p className="mt-4 whitespace-pre-line rounded-lg bg-sand p-3 text-sm">{v.message}</p>
        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">Frais de plateforme</span>
          <span className="text-2xl font-semibold text-primary">{fee}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Le vendeur dispose de {VISIT_RESPONSE_HOURS} h après paiement pour accepter en retenant un créneau. Remboursement intégral s&apos;il refuse ou ne répond pas. Pas de remboursement si vous annulez vous-même.</p>
        {isStripeConfigured() ? (
          <form action={payVisit} className="mt-4">
            <input type="hidden" name="id" value={v.id} />
            <button type="submit" className="btn-primary w-full">
              <CreditCard className="h-4 w-4" /> Payer {fee} par carte
            </button>
          </form>
        ) : (
          <p className="mt-4 rounded-lg bg-pink-soft/60 p-3 text-sm text-[#8a2f40]">Le paiement n&apos;est pas encore configuré sur cette plateforme.</p>
        )}
        <Link href="/visites" className="btn-ghost mt-2 w-full text-sm">
          Plus tard
        </Link>
      </div>
    </AccountShell>
  );
}

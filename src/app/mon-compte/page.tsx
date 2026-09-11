export const dynamic = "force-dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { getSellerListings } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { LISTING_STATUS } from "@/lib/constants";

export const metadata: Metadata = { title: "Mon espace" };

export default async function AccountPage() {
  const { profile, plan, userId } = await requireAccount();
  const listings = await getSellerListings(userId, true);
  const supabase = await createClient();
  let pendingVisits = 0;
  let unread = 0;
  if (supabase) {
    const { count } = await supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("seller_id", userId).eq("status", "pending");
    pendingVisits = count ?? 0;
    const { data: convs } = await supabase.from("conversations").select("id").or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    if (convs?.length) {
      const { count: c } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convs.map((c) => c.id))
        .neq("sender_id", userId)
        .is("read_at", null);
      unread = c ?? 0;
    }
  }
  const active = listings.filter((l) => l.status === "active").length;
  const views = listings.reduce((s, l) => s + l.views_count, 0);
  return (
    <AccountShell profile={profile} plan={plan} title="Tableau de bord">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Annonces en ligne" value={active} href="/mon-compte/annonces" />
        <Stat label="Vues cumulées" value={views} href="/mon-compte/annonces" />
        <Stat label="Demandes de visite en attente" value={pendingVisits} href="/visites" />
        <Stat label="Messages non lus" value={unread} href="/messages" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold">Mes dernières annonces</h2>
          {listings.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Vous n&apos;avez pas encore d&apos;annonce.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {listings.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2">
                  <Link href={`/chevaux/${l.slug}`} className="truncate hover:text-primary">
                    {l.title}
                  </Link>
                  <span className="tag-neutral shrink-0">{LISTING_STATUS[l.status]}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/vendre" className="btn-primary mt-4">
            Déposer une annonce
          </Link>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Vos outils</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/contrats/vente" className="text-primary underline">
                Générer un contrat de vente
              </Link>
            </li>
            <li>
              <Link href="/contrats/depot-vente" className="text-primary underline">
                Mandat de dépôt-vente
              </Link>
            </li>
            <li>
              <Link href="/contrats/essai" className="text-primary underline">
                Convention d&apos;essai
              </Link>
            </li>
            <li>
              <Link href="/guides" className="text-primary underline">
                Guides par profil
              </Link>
            </li>
          </ul>
          {plan === "free" && (
            <div className="mt-4 rounded-xl bg-pink-soft/60 p-3 text-sm">
              <p className="font-medium text-[#8a2f40]">Passez à Contact</p>
              <p className="text-ink/80">Messagerie et téléphone des vendeurs pour 9,90 €/mois, sans engagement.</p>
              <Link href="/abonnement" className="btn-pink mt-2 !py-1.5 text-xs">
                Voir les offres
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountShell>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card p-4 hover:border-primary">
      <p className="text-2xl font-semibold text-primary">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Link>
  );
}

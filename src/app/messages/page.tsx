export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import type { Conversation } from "@/lib/types";
import { canContact } from "@/lib/auth";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { profile, plan, userId } = await requireAccount();
  const supabase = await createClient();
  let convs: Conversation[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("conversations")
      .select("*, listing:listings(id, slug, title, horse_name, photos), buyer:public_profiles!conversations_buyer_id_fkey(id, display_name, role, avatar_url), seller:public_profiles!conversations_seller_id_fkey(id, display_name, role, avatar_url)")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });
    convs = (data ?? []) as unknown as Conversation[];
  }
  return (
    <AccountShell profile={profile} plan={plan} title="Messages">
      {!canContact(plan) && (
        <div className="mb-6 rounded-xl bg-pink-soft/60 p-4 text-sm">
          <p className="font-medium text-[#8a2f40]">Écrire aux vendeurs nécessite l&apos;abonnement Contact.</p>
          <p className="text-ink/80">Vous pouvez toujours répondre aux acheteurs qui vous écrivent et gérer vos demandes de visite gratuitement.</p>
          <Link href="/abonnement" className="btn-pink mt-2 !py-1.5 text-xs">
            Voir l&apos;abonnement Contact
          </Link>
        </div>
      )}
      {convs.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">Aucune conversation.</p>
      ) : (
        <ul className="card divide-y divide-line">
          {convs.map((c) => {
            const other = c.buyer_id === userId ? c.seller : c.buyer;
            return (
              <li key={c.id}>
                <Link href={`/messages/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-sand">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">{other?.display_name?.slice(0, 1).toUpperCase() ?? "?"}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {other?.display_name ?? "Utilisateur"} {c.listing && <span className="text-muted">· {c.listing.horse_name}</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{c.last_message_preview}</p>
                  </div>
                  <time className="text-xs text-muted">{new Date(c.last_message_at).toLocaleDateString("fr-FR")}</time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AccountShell>
  );
}

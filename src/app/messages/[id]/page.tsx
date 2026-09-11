import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell } from "@/components/layout/AccountShell";
import { requireAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Message } from "@/lib/types";
import { sendMessage } from "@/app/actions/messages";
import { canContact } from "@/lib/auth";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, plan, userId } = await requireAccount();
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: conv } = await supabase
    .from("conversations")
    .select("*, listing:listings(id, slug, title, horse_name, photos), buyer:public_profiles!conversations_buyer_id_fkey(id, display_name, role, avatar_url), seller:public_profiles!conversations_seller_id_fkey(id, display_name, role, avatar_url)")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();
  const c = conv as unknown as Conversation;
  const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at");
  const messages = (msgs ?? []) as Message[];
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", id).neq("sender_id", userId).is("read_at", null);
  const other = c.buyer_id === userId ? c.seller : c.buyer;
  const isSeller = c.seller_id === userId;
  const canWrite = isSeller || canContact(plan);
  return (
    <AccountShell profile={profile} plan={plan} title={`Conversation avec ${other?.display_name ?? "—"}`}>
      {c.listing && (
        <p className="mb-4 text-sm text-muted">
          À propos de{" "}
          <Link href={`/chevaux/${c.listing.slug}`} className="text-primary underline">
            {c.listing.title}
          </Link>
        </p>
      )}
      <div className="card flex max-h-[60vh] flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "self-end bg-primary text-white" : "self-start bg-sand"}`}>
              <p className="whitespace-pre-line">{m.body}</p>
              <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>{new Date(m.created_at).toLocaleString("fr-FR")}</p>
            </div>
          );
        })}
      </div>
      {canWrite ? (
        <form action={sendMessage} className="mt-4 flex gap-2">
          <input type="hidden" name="conversationId" value={id} />
          <textarea name="body" rows={2} required className="input flex-1" placeholder="Votre message…" />
          <button type="submit" className="btn-primary self-end">
            Envoyer
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl bg-pink-soft/60 p-3 text-sm">
          Votre abonnement Contact est terminé.{" "}
          <Link href="/abonnement" className="text-primary underline">
            Le réactiver
          </Link>{" "}
          pour continuer la conversation.
        </p>
      )}
      <p className="mt-4 text-xs text-muted">Ne communiquez jamais de coordonnées bancaires par messagerie. Aucun acompte avant d&apos;avoir vu le cheval.</p>
    </AccountShell>
  );
}

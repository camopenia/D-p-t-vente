"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Lock, MessageCircle, Phone } from "lucide-react";
import { startConversation, revealPhone } from "@/app/actions/messages";
import type { ActionState } from "@/app/actions/visits";

export function ContactSeller({ listingId, sellerId, loggedIn, canContact, isOwner }: { listingId: string; sellerId: string; loggedIn: boolean; canContact: boolean; isOwner: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(startConversation, null);
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isOwner) return <p className="rounded-xl bg-sand p-3 text-xs text-muted">Ceci est votre annonce.</p>;

  if (!loggedIn || !canContact) {
    return (
      <div className="rounded-xl border border-line bg-sand p-4 text-sm">
        <p className="flex items-center gap-2 font-medium text-ink">
          <Lock className="h-4 w-4 text-primary" /> Messagerie et téléphone
        </p>
        <p className="mt-1 text-muted">Réservés aux abonnés Contact (9,90 €/mois, sans engagement). Les demandes de visite et d&apos;essai restent gratuites.</p>
        <Link href={loggedIn ? "/abonnement" : "/connexion?next=/abonnement"} className="btn-neutral mt-3 w-full">
          {loggedIn ? "Découvrir l'abonnement Contact" : "Se connecter"}
        </Link>
      </div>
    );
  }

  async function onReveal() {
    setPhoneError(null);
    const res = await revealPhone(listingId);
    if (res.phone) setPhone(res.phone);
    else if (res.error === "subscription") setPhoneError("Abonnement Contact requis.");
    else if (res.error === "demo") setPhoneError("Indisponible en mode démonstration.");
    else setPhoneError(res.phone === undefined && !res.error ? "Le vendeur n'a pas renseigné de téléphone." : res.error ?? "Erreur");
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={onReveal} className="btn-neutral w-full">
        <Phone className="h-4 w-4" /> {phone ? <a href={`tel:${phone}`}>{phone}</a> : "Afficher le téléphone"}
      </button>
      {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
      {!showForm ? (
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary w-full">
          <MessageCircle className="h-4 w-4" /> Envoyer un message
        </button>
      ) : (
        <form action={action} className="space-y-2">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="sellerId" value={sellerId} />
          <textarea name="body" rows={4} required minLength={10} className="input" placeholder="Bonjour, je suis intéressé(e) par votre cheval…" />
          {state && !state.ok && <p className="text-xs text-red-600">{state.message}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Envoi…" : "Envoyer"}
          </button>
        </form>
      )}
    </div>
  );
}

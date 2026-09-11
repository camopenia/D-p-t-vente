"use client";
import { useActionState } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { requestVisit, type ActionState } from "@/app/actions/visits";

export function VisitRequestForm({ listingId, sellerId, trialAvailable, loggedIn }: { listingId: string; sellerId: string; trialAvailable: boolean; loggedIn: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestVisit, null);
  if (!loggedIn) {
    return (
      <div className="rounded-xl bg-primary-soft p-4 text-sm">
        <p className="font-medium text-primary">Visites et essais gratuits</p>
        <p className="mt-1 text-ink/80">Créez un compte gratuit pour demander une visite ou un essai monté.</p>
        <Link href={`/connexion?next=/chevaux`} className="btn-primary mt-3 w-full">
          Se connecter pour demander une visite
        </Link>
      </div>
    );
  }
  if (state?.ok) return <p className="rounded-xl bg-primary-soft p-4 text-sm text-primary">{state.message}</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="sellerId" value={sellerId} />
      <div>
        <label className="label" htmlFor="kind">
          Je souhaite
        </label>
        <select id="kind" name="kind" className="input" defaultValue="visite">
          <option value="visite">Visiter le cheval</option>
          {trialAvailable && <option value="essai">Faire un essai monté</option>}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="preferredDate">
          Date souhaitée (facultatif)
        </label>
        <input id="preferredDate" name="preferredDate" type="date" className="input" min={new Date().toISOString().slice(0, 10)} />
      </div>
      <div>
        <label className="label" htmlFor="message">
          Votre projet
        </label>
        <textarea id="message" name="message" rows={4} required minLength={20} className="input" placeholder="Votre niveau, votre projet avec le cheval, qui vous accompagnera (coach), vos disponibilités…" />
        <p className="helper">Un message précis obtient plus de réponses. Casque obligatoire lors de l&apos;essai.</p>
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        <CalendarCheck className="h-4 w-4" /> {pending ? "Envoi…" : "Envoyer la demande (gratuit)"}
      </button>
    </form>
  );
}

"use client";
import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CreditCard } from "lucide-react";
import { requestVisit, type ActionState } from "@/app/actions/visits";
import { PERIODS, VISIT_FEE_CENTS, VISIT_RESPONSE_HOURS, upcomingSlots, type VisitAvailability, type VisitSlot } from "@/lib/constants";

const MAX_SLOTS = 6;

export function VisitRequestForm({ listingId, sellerId, trialAvailable, loggedIn, availability, slug }: { listingId: string; sellerId: string; trialAvailable: boolean; loggedIn: boolean; availability: VisitAvailability; slug: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestVisit, null);
  const [chosen, setChosen] = useState<VisitSlot[]>([]);
  const slots = useMemo(() => upcomingSlots(availability), [availability]);
  const fee = (VISIT_FEE_CENTS / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  // regroupement par semaine pour l'affichage
  const weeks = useMemo(() => {
    const map = new Map<string, VisitSlot[]>();
    for (const s of slots) {
      const d = new Date(s.date + "T12:00:00");
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [slots]);

  if (!loggedIn) {
    return (
      <div className="rounded-xl bg-primary-soft p-4 text-sm">
        <p className="font-medium text-primary">Visite ou essai : {fee} par demande</p>
        <p className="mt-1 text-ink/80">Créez un compte pour proposer vos créneaux au vendeur. Frais remboursés s&apos;il refuse ou ne répond pas sous {VISIT_RESPONSE_HOURS} h.</p>
        <Link href={`/connexion?next=/chevaux/${slug}`} className="btn-primary mt-3 w-full">
          Se connecter pour demander une visite
        </Link>
      </div>
    );
  }
  if (state?.ok) return <p className="rounded-xl bg-primary-soft p-4 text-sm text-primary">{state.message}</p>;
  if (slots.length === 0) return <p className="rounded-xl bg-sand p-4 text-sm text-muted">Le vendeur n&apos;a pas encore indiqué de disponibilités. Contactez-le par messagerie.</p>;

  const isOn = (s: VisitSlot) => chosen.some((c) => c.date === s.date && c.period === s.period);
  const toggle = (s: VisitSlot) => setChosen((cur) => (isOn(s) ? cur.filter((c) => !(c.date === s.date && c.period === s.period)) : cur.length < MAX_SLOTS ? [...cur, s] : cur));

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="sellerId" value={sellerId} />
      <input type="hidden" name="slots" value={JSON.stringify(chosen)} />
      <div>
        <label className="label" htmlFor="kind">
          Je souhaite <span className="text-red-600">*</span>
        </label>
        <select id="kind" name="kind" className="input" defaultValue="visite">
          <option value="visite">Visiter le cheval</option>
          {trialAvailable && <option value="essai">Faire un essai monté</option>}
        </select>
      </div>
      <fieldset>
        <legend className="label">
          Mes créneaux possibles <span className="text-red-600">*</span> <span className="font-normal text-muted">({chosen.length}/{MAX_SLOTS})</span>
        </legend>
        <p className="mb-2 text-xs text-muted">Proposez plusieurs moments parmi les disponibilités du vendeur : il en retiendra un.</p>
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-line p-2">
          {weeks.map(([monday, list]) => (
            <div key={monday}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Semaine du {new Date(monday + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
              <div className="flex flex-wrap gap-1.5">
                {list.map((s) => {
                  const on = isOn(s);
                  const d = new Date(s.date + "T12:00:00");
                  return (
                    <button key={s.date + s.period} type="button" onClick={() => toggle(s)} aria-pressed={on} className={`rounded-full border px-2.5 py-1 text-xs ${on ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary"}`}>
                      {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })} · {PERIODS[s.period].toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="message">
          Votre projet <span className="text-red-600">*</span>
        </label>
        <textarea id="message" name="message" rows={4} required minLength={20} className="input" placeholder="Votre niveau, votre projet avec le cheval, qui vous accompagnera (coach)…" />
        <p className="helper">Un message précis obtient plus de réponses. Casque obligatoire lors de l&apos;essai.</p>
      </div>
      <div className="rounded-lg bg-sand p-3 text-xs text-muted">
        <p className="flex items-center gap-1.5 font-medium text-ink">
          <CreditCard className="h-3.5 w-3.5 text-primary" /> Frais de plateforme : {fee}
        </p>
        <p className="mt-1">Réglés par carte après validation. Le vendeur a {VISIT_RESPONSE_HOURS} h pour accepter en retenant un créneau. S&apos;il refuse ou ne répond pas, vous êtes remboursé intégralement.</p>
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending || chosen.length === 0} className="btn-primary w-full disabled:bg-line disabled:text-muted">
        <CalendarCheck className="h-4 w-4" /> {pending ? "Envoi…" : `Envoyer la demande et payer ${fee}`}
      </button>
    </form>
  );
}

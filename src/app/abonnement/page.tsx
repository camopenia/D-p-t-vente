import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, ACCOMPAGNEMENT_RATE, type PlanId } from "@/lib/constants";
import { getCurrentSubscription, getCurrentUser, planOf } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Abonnement",
  description: "Consultation et publication gratuites, 10 € par demande de visite remboursés sans réponse du vendeur, messagerie et téléphone avec l'abonnement Contact.",
};

export default async function AbonnementPage({ searchParams }: { searchParams: Promise<{ success?: string; cancel?: string }> }) {
  const { success, cancel } = await searchParams;
  const user = await getCurrentUser();
  const sub = await getCurrentSubscription();
  const plan = planOf(sub);
  const stripeReady = isStripeConfigured();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Gratuit pour chercher et publier, 10 € par visite, abonnement pour échanger</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Chaque demande de visite ou d&apos;essai coûte 10 € de frais de plateforme, remboursés si le vendeur refuse ou ne répond pas sous 48 h. Pour échanger directement par messagerie ou téléphone avec les vendeurs, choisissez l&apos;abonnement Contact, sans engagement.
        </p>
      </div>
      {success && <p className="mx-auto mt-6 max-w-xl rounded-xl bg-primary-soft p-4 text-center text-sm text-primary">Merci ! Votre abonnement est en cours d&apos;activation (quelques secondes). Vous pouvez dès maintenant contacter les vendeurs.</p>}
      {cancel && <p className="mx-auto mt-6 max-w-xl rounded-xl bg-sand p-4 text-center text-sm text-muted">Paiement annulé. Vous pouvez réessayer quand vous voulez.</p>}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          const current = plan === id;
          const highlight = id === "contact";
          return (
            <div key={id} className={`card relative flex flex-col p-6 ${highlight ? "border-primary ring-2 ring-primary-light" : ""}`}>
              {highlight && <span className="tag-pink absolute -top-3 left-6">Le plus choisi</span>}
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-sm text-muted">{p.tagline}</p>
              <p className="mt-4 text-3xl font-semibold text-primary">
                {p.price === 0 ? "Gratuit" : `${p.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`}
                <span className="text-sm font-normal text-muted"> {p.period}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
                {p.limits.map((f) => (
                  <li key={f} className="flex gap-2 text-muted">
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-center">–</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {current ? (
                  <span className="btn-neutral w-full cursor-default">Votre offre actuelle</span>
                ) : id === "free" ? (
                  <Link href={user ? "/chevaux" : "/inscription"} className="btn-neutral w-full">
                    {user ? "Parcourir les annonces" : "Créer un compte gratuit"}
                  </Link>
                ) : !user ? (
                  <Link href={`/connexion?next=/abonnement`} className="btn-primary w-full">
                    Se connecter pour s&apos;abonner
                  </Link>
                ) : stripeReady ? (
                  <form action="/api/stripe/checkout" method="post">
                    <input type="hidden" name="plan" value={id} />
                    <button type="submit" className={`w-full ${highlight ? "btn-primary" : "btn-neutral"}`}>
                      Choisir {p.name}
                    </button>
                  </form>
                ) : (
                  <span className="btn-neutral w-full cursor-not-allowed opacity-70">Paiement bientôt disponible</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="card mx-auto mt-10 max-w-3xl border-primary/30 bg-primary-soft/40 p-6">
        <span className="tag-primary">Pour les vendeurs</span>
        <h2 className="mt-3 text-xl font-semibold">Vente accompagnée : {ACCOMPAGNEMENT_RATE} % du prix de vente, uniquement si le cheval est vendu</h2>
        <p className="mt-2 text-sm text-muted">
          Nous rédigeons et publions l&apos;annonce, nous trions les contacts et nous pré-sélectionnons les acheteurs sérieux. En option : essais à votre place, photos et vidéo. Aucun frais d&apos;avance, premier rendez-vous sans engagement.
        </p>
        <Link href="/vente-accompagnee" className="btn-primary mt-4">
          En savoir plus
        </Link>
      </section>

      {sub?.stripe_customer_id && (
        <form action="/api/stripe/portal" method="post" className="mt-8 text-center">
          <button type="submit" className="btn-ghost text-sm">
            Gérer mon abonnement (factures, résiliation)
          </button>
          {sub.cancel_at_period_end && sub.current_period_end && <p className="mt-2 text-xs text-muted">Résiliation programmée le {new Date(sub.current_period_end).toLocaleDateString("fr-FR")}.</p>}
        </form>
      )}

      <section className="mx-auto mt-14 max-w-3xl">
        <h2 className="text-xl font-semibold">Pourquoi ce modèle ?</h2>
        <div className="prose-cv mt-2 text-sm">
          <p>
            Nous voulons que chaque cheval trouve le bon cavalier. Publier une annonce reste gratuit pour ne pas freiner l&apos;offre. Les frais de visite (10 €) filtrent les demandes non sérieuses et rémunèrent la plateforme sans commission sur la vente ; ils sont remboursés quand le vendeur ne donne pas suite. L&apos;abonnement Contact finance la modération, la vérification des professionnels et les outils (contrats, guides, messagerie sécurisée).
          </p>
          <p>Pas de mise en avant payante qui noie les annonces des particuliers : le classement dépend de la fraîcheur et de la complétude de l&apos;annonce.</p>
        </div>
        <h2 className="mt-8 text-xl font-semibold">Questions fréquentes</h2>
        <dl className="mt-3 space-y-4 text-sm">
          {[
            ["Puis-je résilier à tout moment ?", "Oui, depuis votre espace en un clic. L'abonnement reste actif jusqu'à la fin de la période payée."],
            ["Un vendeur doit-il s'abonner pour répondre ?", "Non. Les vendeurs répondent gratuitement aux messages et aux demandes de visite qu'ils reçoivent."],
            ["Que se passe-t-il si le vendeur ne répond pas à ma demande de visite ?", "Il dispose de 48 h après votre paiement. Sans réponse, ou s'il refuse, les 10 € vous sont remboursés automatiquement sur votre carte."],
            ["L'abonnement Pro est-il obligatoire pour un éleveur ?", "Non. Il apporte une page vitrine, des statistiques et le badge vérifié, mais la publication reste gratuite."],
            ["Prenez-vous une commission sur la vente ?", `Non pour les annonces classiques : la transaction se fait directement entre vendeur et acheteur, avec nos modèles de contrats. Seule l'offre optionnelle Vente accompagnée, où nous gérons la vente pour vous, est rémunérée ${ACCOMPAGNEMENT_RATE} % du prix de vente, uniquement si le cheval est vendu.`],
          ].map(([q, a]) => (
            <div key={q} className="card p-4">
              <dt className="font-medium">{q}</dt>
              <dd className="mt-1 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

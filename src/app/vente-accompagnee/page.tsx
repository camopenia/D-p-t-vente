import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, Check, ClipboardList, Filter, Handshake, Camera, Users, Megaphone } from "lucide-react";
import { ACCOMPAGNEMENT_RATE, CALENDLY_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Vente accompagnée : on vend votre cheval pour vous",
  description: `Cavalons rédige et publie votre annonce, trie les contacts et pré-sélectionne les acheteurs sérieux. ${ACCOMPAGNEMENT_RATE} % du prix de vente, uniquement si le cheval est vendu. Rendez-vous sans engagement.`,
};

const INCLUDED = [
  {
    icon: Megaphone,
    title: "Rédaction et publication de l'annonce",
    text: "Nous rédigeons une annonce complète et honnête à partir de vos informations, nous la publions sur Cavalons Ventes et la diffusons à notre communauté de 50 000 cavaliers et sur nos réseaux.",
  },
  {
    icon: Filter,
    title: "Tri de tous les contacts",
    text: "Nous répondons à chaque demande, nous écartons les curieux, les revendeurs et les arnaques, et nous qualifions chaque acheteur : niveau, projet pour le cheval, budget, délai.",
  },
  {
    icon: Users,
    title: "Pré-sélection des acheteurs",
    text: "Vous ne rencontrez que des candidats sérieux, avec une fiche par acheteur. Nous organisons les créneaux de visite selon vos disponibilités.",
  },
  {
    icon: Handshake,
    title: "Accompagnement jusqu'à la vente",
    text: "Négociation, contrat de vente, conseils pour la visite vétérinaire d'achat et la déclaration au SIRE : nous restons à vos côtés jusqu'à la signature.",
  },
];

const OPTIONS = [
  {
    icon: CalendarCheck,
    title: "Essais à votre place",
    text: "Un cavalier Cavalons présente votre cheval et encadre les essais avec les acheteurs, si vous ne pouvez pas être présent.",
  },
  {
    icon: Camera,
    title: "Photos et vidéo",
    text: "Séance photo et vidéo sur place (au pré, monté, aux trois allures) pour une annonce qui se démarque.",
  },
];

const STEPS = [
  ["Un rendez-vous de 15 minutes", "Vous réservez un créneau, en visio ou par téléphone. On parle de votre cheval, de votre prix, de vos contraintes. Sans engagement."],
  ["On valide ensemble", "Prix de vente, points forts, ce que vous voulez pour le cheval. Nous signons un mandat simple, résiliable à tout moment."],
  ["L'annonce est en ligne sous 48 h", "Rédigée, relue, publiée et diffusée. Vous la validez avant publication."],
  ["Vous recevez les candidats sérieux", "Nous gérons les échanges et vous transmettons uniquement les acheteurs pré-sélectionnés, avec les créneaux de visite."],
  ["La vente est conclue", `Contrat, remise des papiers, déclaration SIRE. Nos honoraires, ${ACCOMPAGNEMENT_RATE} % du prix de vente, sont dus uniquement à ce moment-là.`],
];

const FAQ = [
  ["Combien ça coûte ?", `${ACCOMPAGNEMENT_RATE} % du prix de vente, payés uniquement si le cheval est vendu par notre intermédiaire. Aucun frais d'entrée, aucun abonnement. Exemple : un cheval vendu 8 000 € = 800 € d'honoraires. Les options essais et photos sont chiffrées à part, sur devis, avant toute intervention.`],
  ["Suis-je engagé ?", "Le rendez-vous est sans engagement. Si vous nous confiez la vente, nous signons un mandat simple que vous pouvez résilier à tout moment. Rien n'est dû si le cheval n'est pas vendu."],
  ["Qui fixe le prix ?", "Vous. Nous vous donnons notre estimation à partir du marché et des ventes comparables, mais la décision vous appartient."],
  ["Le cheval doit-il changer d'écurie ?", "Non. Il reste chez vous, dans son environnement. Les visites se font sur place, aux créneaux que vous choisissez."],
  ["Comment sont sélectionnés les acheteurs ?", "Nous échangeons avec chaque personne intéressée avant de vous la présenter : expérience, projet pour le cheval, encadrement, budget réel, délai. Nous vérifions aussi les signaux d'arnaque (paiement à distance, transporteur inconnu, précipitation)."],
  ["Et si je préfère tout gérer moi-même ?", "La publication d'une annonce classique reste gratuite. La vente accompagnée est une option pour celles et ceux qui manquent de temps ou préfèrent déléguer le tri des contacts."],
];

export default function VenteAccompagneePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-light/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-[1.3fr_1fr] md:pb-20 md:pt-20">
          <div>
            <span className="tag bg-white/15 text-white">Vente accompagnée</span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">On vend votre cheval pour vous.</h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
              Vous nous confiez la vente : nous rédigeons et publions l&apos;annonce, nous trions tous les contacts et nous pré-sélectionnons les acheteurs. Vous ne rencontrez que des candidats sérieux.
            </p>
            <p className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2 text-sm">
              <span className="text-xl font-semibold">{ACCOMPAGNEMENT_RATE} %</span> du prix de vente, uniquement si le cheval est vendu. Aucun frais d&apos;avance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={CALENDLY_URL} target="_blank" rel="noopener" className="btn-pink !py-3">
                <CalendarCheck className="h-4 w-4" /> Prendre rendez-vous (15 min, sans engagement)
              </a>
              <Link href="/vendre" className="btn-ghost !py-3 text-white hover:bg-white/10">
                Je préfère publier moi-même
              </Link>
            </div>
          </div>
          <div className="hidden justify-center md:flex">
            <Image src="/brand/mascotte-annonce.png" alt="Mascotte Cavalons présentant une annonce" width={300} height={420} className="h-auto w-60 drop-shadow-2xl" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold">Ce qui est compris</h2>
        <p className="mt-1 text-sm text-muted">Tout ce qui prend du temps et de l&apos;énergie dans une vente, nous le faisons pour vous.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {INCLUDED.map((it) => (
            <div key={it.title} className="card flex gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{it.title}</h3>
                <p className="mt-1 text-sm text-muted">{it.text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">En option, sur devis</h2>
        <p className="mt-1 text-sm text-muted">Deux services supplémentaires, chiffrés avant toute intervention.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {OPTIONS.map((it) => (
            <div key={it.title} className="card flex gap-4 border-pink/60 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-soft text-[#8a2f40]">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{it.title}</h3>
                <p className="mt-1 text-sm text-muted">{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold">Comment ça se passe</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-5">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="card p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <h2 className="text-2xl font-semibold">Pour qui ?</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Vous manquez de temps pour répondre aux messages, filtrer les curieux et organiser les visites.",
                "Vous vendez pour la première fois et vous voulez éviter les erreurs et les arnaques.",
                "Vous êtes éleveur ou vous avez plusieurs chevaux à vendre en même temps.",
                "Vous habitez loin de votre cheval, ou vous ne pouvez pas être présent aux essais.",
                "Vous voulez un tarif clair : rien à payer tant que le cheval n'est pas vendu.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
            <div className="card mt-8 bg-primary-soft/50 p-5">
              <p className="flex items-center gap-2 font-semibold">
                <ClipboardList className="h-4 w-4 text-primary" /> Ce dont on parle au premier rendez-vous
              </p>
              <p className="mt-2 text-sm text-muted">Votre cheval (âge, niveau, papiers, santé), le prix que vous avez en tête, vos disponibilités pour les visites, et ce que vous souhaitez pour lui : type de cavalier, projet, distance. Vous repartez avec notre avis sur le prix, que vous nous confiiez la vente ou non.</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Questions fréquentes</h2>
            <dl className="mt-5 space-y-3 text-sm">
              {FAQ.map(([q, a]) => (
                <div key={q} className="card p-4">
                  <dt className="font-medium">{q}</dt>
                  <dd className="mt-1 text-muted">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Parlons de votre cheval</h2>
            <p className="mt-2 text-white/85">15 minutes, en visio ou par téléphone, sans engagement. Vous repartez au minimum avec un avis sur le prix.</p>
          </div>
          <a href={CALENDLY_URL} target="_blank" rel="noopener" className="btn-pink !py-3">
            <CalendarCheck className="h-4 w-4" /> Réserver un créneau
          </a>
        </div>
      </section>
    </>
  );
}

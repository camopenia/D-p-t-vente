export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, FileText, ShieldCheck, Search, BookOpen, Users, HeartHandshake, BadgeEuro } from "lucide-react";
import { ListingGrid } from "@/components/listings/ListingCard";
import { getFeaturedListings } from "@/lib/listings";
import { ROLES, ACCOMPAGNEMENT_RATE } from "@/lib/constants";

const AUDIENCES: { role: keyof typeof ROLES; href: string; text: string }[] = [
  { role: "acheteur", href: "/guides/acheteurs", text: "Trouvez le bon cheval, proposez vos créneaux de visite ou d'essai, sécurisez l'achat avec la visite vétérinaire et le contrat type." },
  { role: "particulier", href: "/guides/particuliers-vendeurs", text: "Publiez une annonce complète en 10 minutes, gérez les demandes de visite, vendez avec un contrat clair." },
  { role: "eleveur", href: "/guides/eleveurs", text: "Présentez vos foals et jeunes chevaux avec origines, vidéos et papiers. Page vitrine de votre élevage." },
  { role: "pro_depot", href: "/guides/professionnels-depot-vente", text: "Gérez vos chevaux en dépôt-vente pour le compte de propriétaires, avec mandat et commission transparents." },
];

const WHY_US = [
  {
    icon: Users,
    title: "50 000 cavaliers déjà réunis",
    text: "La communauté de la demi-pension Cavalons : des cavaliers qui montent, cherchent un cheval ou en ont un à vendre. Votre annonce est vue par les bonnes personnes.",
  },
  {
    icon: HeartHandshake,
    title: "On vient du secteur",
    text: "Fondée par des cavaliers et des propriétaires. Chaque fonctionnalité répond à un problème vécu : visites qui ne se font pas, papiers manquants, vendeurs injoignables.",
  },
  {
    icon: ShieldCheck,
    title: "Des annonces vérifiées",
    text: "Chaque annonce est relue avant publication. Numéro SIRE demandé, professionnels vérifiés, signalements traités : moins d'arnaques, plus de confiance.",
  },
  {
    icon: BadgeEuro,
    title: "Un modèle transparent",
    text: "Publication gratuite, aucune commission sur le prix de vente. Seuls les services utiles sont payants : la mise en relation et les demandes de visite.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedListings(6);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-light/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-pink/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-24 pt-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pb-28 md:pt-24">
          <div>
            <span className="tag bg-white/15 text-white">cavalons.ensemble</span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Acheter ou vendre un cheval, en toute confiance.</h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
              La plateforme qui réunit éleveurs, particuliers, professionnels du dépôt-vente et acheteurs. Visites et essais sur créneaux, contrats de vente prêts à l&apos;emploi, guides pour chaque étape.
            </p>
            <form action="/chevaux" className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
              <label htmlFor="hero-q" className="sr-only">
                Rechercher un cheval
              </label>
              <input id="hero-q" name="q" placeholder="Race, discipline, nom du père, ville…" className="input flex-1 !py-3 text-ink" />
              <button type="submit" className="btn-pink !py-3">
                <Search className="h-4 w-4" /> Rechercher
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {["CSO", "Dressage", "Loisir / balade", "Complet", "Élevage / reproduction"].map((d) => (
                <Link key={d} href={`/chevaux?discipline=${encodeURIComponent(d)}`} className="rounded-full border border-white/30 px-3 py-1 hover:bg-white/10">
                  {d}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <Image src="/brand/mascotte-annonce.png" alt="Mascotte Cavalons annonçant une vente" width={340} height={480} className="h-auto w-72 drop-shadow-2xl" priority />
          </div>
        </div>
      </section>

      {/* Réassurance */}
      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <div className="card grid gap-6 p-6 sm:grid-cols-3">
          {[
            { icon: CalendarCheck, title: "Visites et essais organisés", text: "Proposez vos créneaux parmi les disponibilités du vendeur, 10 € par demande remboursés s'il refuse ou ne répond pas sous 48 h." },
            { icon: FileText, title: "Contrats prêts à l'emploi", text: "Contrat de vente, mandat de dépôt-vente, convention d'essai : générés en ligne, imprimables." },
            { icon: ShieldCheck, title: "Vendeurs identifiés", text: "Statut déclaré (éleveur, particulier, pro), SIRET contrôlé pour les pros, charte de bonne conduite signée." },
          ].map((b) => (
            <div key={b.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">{b.title}</h2>
                <p className="mt-1 text-sm text-muted">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Annonces */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Dernières annonces</h2>
            <p className="mt-1 text-sm text-muted">Chevaux et poneys récemment mis en vente.</p>
          </div>
          <Link href="/chevaux" className="btn-ghost">
            Voir toutes les annonces
          </Link>
        </div>
        <ListingGrid listings={featured} empty="Aucune annonce pour le moment. Soyez le premier à publier !" />
      </section>

      {/* Publics */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold">Un espace pour chaque acteur de la vente</h2>
          <p className="mt-1 text-sm text-muted">Des guides et des outils adaptés à votre situation.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {AUDIENCES.map((a) => (
              <Link key={a.role} href={a.href} className="card group flex gap-4 p-5 transition hover:border-primary">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-soft text-[#8a2f40]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary">{ROLES[a.role].label}</h3>
                  <p className="mt-1 text-sm text-muted">{a.text}</p>
                  <span className="mt-2 inline-block text-sm font-medium text-primary">Lire le guide →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="bg-primary-soft/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pourquoi nous</p>
              <h2 className="mt-2 text-2xl font-semibold">Une plateforme née dans le milieu, pas à côté</h2>
              <p className="mt-3 text-muted">
                Cavalons Ventes prolonge{" "}
                <a href="https://cavalons.fr" className="font-medium text-primary underline-offset-2 hover:underline" target="_blank" rel="noopener">
                  cavalons.fr
                </a>
                , la plateforme de demi-pension qui réunit déjà une communauté de 50 000 cavaliers. Nous sommes cavaliers et propriétaires avant d&apos;être un site : on connaît les essais qui n&apos;aboutissent pas, les papiers qui manquent et les prix qui ne veulent rien dire.
              </p>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {WHY_US.map((w) => (
                  <li key={w.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <w.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{w.title}</h3>
                      <p className="mt-1 text-sm text-muted">{w.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["50 000", "cavaliers dans la communauté"],
                  ["0 %", "de commission sur la vente"],
                  ["24 h", "pour valider une annonce"],
                  ["48 h", "de réponse à une demande de visite"],
                ].map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-white p-4 shadow-sm">
                    <dt className="text-2xl font-semibold text-primary">{n}</dt>
                    <dd className="mt-1 text-xs text-muted">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Image src="/brand/mascotte-amoureux.png" alt="Mascotte Cavalons, cavalier et cheval complices" width={340} height={480} className="h-auto w-56 sm:w-72" />
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold">Comment ça marche</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            ["Cherchez ou publiez", "Annonces structurées : origines, niveau réel, papiers SIRE, radios, vidéos. Publication gratuite."],
            ["Visitez, essayez", "Choisissez vos créneaux parmi les disponibilités du vendeur (10 € par demande). Il confirme sous 48 h."],
            ["Échangez", "Messagerie et téléphone des vendeurs avec l'abonnement Contact, sans engagement."],
            ["Concluez sereinement", "Visite vétérinaire d'achat, contrat de vente type, déclaration SIRE sous 30 jours."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/vendre" className="btn-primary">
            Déposer une annonce
          </Link>
          <Link href="/guides" className="btn-neutral">
            <BookOpen className="h-4 w-4" /> Parcourir les guides
          </Link>
          <Link href="/contrats" className="btn-neutral">
            <FileText className="h-4 w-4" /> Modèles de contrats
          </Link>
        </div>
      </section>

      {/* Vente accompagnée */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="card flex flex-col gap-6 border-primary/30 bg-primary-soft/40 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pas le temps de gérer la vente ?</p>
            <h2 className="mt-1 text-2xl font-semibold">On vend votre cheval pour vous</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Nous rédigeons et publions l&apos;annonce, nous trions tous les contacts et nous vous présentons uniquement des acheteurs sérieux. {ACCOMPAGNEMENT_RATE} % du prix de vente, uniquement si le cheval est vendu. Premier rendez-vous de 15 minutes sans engagement.
            </p>
          </div>
          <Link href="/vente-accompagnee" className="btn-primary shrink-0">
            Découvrir la vente accompagnée
          </Link>
        </div>
      </section>
    </>
  );
}

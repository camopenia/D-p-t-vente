export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, FileText, ShieldCheck, Search, BookOpen, Users } from "lucide-react";
import { ListingGrid } from "@/components/listings/ListingCard";
import { getFeaturedListings } from "@/lib/listings";
import { ROLES } from "@/lib/constants";

const AUDIENCES: { role: keyof typeof ROLES; href: string; text: string }[] = [
  { role: "acheteur", href: "/guides/acheteurs", text: "Trouvez le bon cheval, proposez vos créneaux de visite ou d'essai, sécurisez l'achat avec la visite vétérinaire et le contrat type." },
  { role: "particulier", href: "/guides/particuliers-vendeurs", text: "Publiez une annonce complète en 10 minutes, gérez les demandes de visite, vendez avec un contrat clair." },
  { role: "eleveur", href: "/guides/eleveurs", text: "Présentez vos foals et jeunes chevaux avec origines, vidéos et papiers. Page vitrine de votre élevage." },
  { role: "pro_depot", href: "/guides/professionnels-depot-vente", text: "Gérez vos chevaux en dépôt-vente pour le compte de propriétaires, avec mandat et commission transparents." },
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
    </>
  );
}

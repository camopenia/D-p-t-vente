import Link from "next/link";
import Image from "next/image";

const COLS = [
  {
    title: "À propos",
    links: [
      { href: "/comment-ca-marche", label: "Comment ça marche" },
      { href: "/abonnement", label: "Abonnement" },
      { href: "/vente-accompagnee", label: "Vente accompagnée" },
      { href: "/pros", label: "Éleveurs & dépôts-ventes" },
      { href: "https://www.cavalons.fr", label: "Cavalons demi-pension" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/contrats", label: "Modèles de contrats" },
      { href: "/guides/eviter-les-arnaques", label: "Éviter les arnaques" },
      { href: "/contact", label: "Nous contacter" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/cgu", label: "CGU" },
      { href: "/charte", label: "Pacte de bonne conduite" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-mark.svg" alt="" width={72} height={64} className="h-16 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-muted">
            La plateforme dédiée à la vente de chevaux entre éleveurs, particuliers, professionnels du dépôt-vente et acheteurs.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">Sécurité — Transparence — Bien-être du cheval</p>
          <p className="mt-3 text-sm text-muted">
            Une question ?{" "}
            <a className="text-primary underline" href="mailto:contact@cavalons.fr">
              contact@cavalons.fr
            </a>
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} Cavalons. Tous droits réservés. cavalons.ensemble</span>
          <span>Les modèles de contrats sont fournis à titre informatif et ne remplacent pas un conseil juridique.</span>
        </div>
      </div>
    </footer>
  );
}

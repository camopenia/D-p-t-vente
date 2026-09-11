import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { GUIDES } from "@/lib/content/guides";
import { ROLES, type Role } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Guides pour acheter et vendre un cheval",
  description: "Guides pratiques pour acheteurs, vendeurs particuliers, éleveurs et professionnels du dépôt-vente : annonces, visites, essais, visite vétérinaire, contrats, arnaques.",
};

const ORDER: (Role | "tous")[] = ["acheteur", "particulier", "eleveur", "pro_depot", "tous"];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Guides</h1>
      <p className="mt-2 max-w-2xl text-muted">Les bonnes pratiques rassemblées auprès de l&apos;IFCE, des forums, des places de marché et des juristes du droit équin, adaptées à chaque profil.</p>
      {ORDER.map((aud) => {
        const items = GUIDES.filter((g) => g.audience === aud);
        if (!items.length) return null;
        return (
          <section key={aud} className="mt-10">
            <h2 className="mb-4 text-xl font-semibold">{aud === "tous" ? "Pour tous" : ROLES[aud].label}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="card group p-5 transition hover:border-primary">
                  <h3 className="font-semibold group-hover:text-primary">{g.title}</h3>
                  <p className="mt-1 text-sm text-muted">{g.summary}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" /> {g.readingMinutes} min de lecture
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

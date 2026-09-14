export const dynamic = "force-dynamic";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Filters } from "@/components/listings/Filters";
import { ListingGrid } from "@/components/listings/ListingCard";
import { parseFilters, searchListings } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Chevaux et poneys à vendre",
  description: "Toutes les annonces de chevaux à vendre : CSO, dressage, loisir, jeunes chevaux, poneys. Filtrez par race, âge, prix, région, radios et essai.",
};

export default async function ChevauxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const { items, total, page, pages } = await searchListings(filters);
  const base = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" && v ? [[k, v]] : [])));

  const pageLink = (p: number) => {
    const u = new URLSearchParams(base);
    u.set("page", String(p));
    return `/chevaux?${u.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Chevaux et poneys à vendre</h1>
          <p className="mt-1 text-sm text-muted">
            {total} annonce{total > 1 ? "s" : ""} · visites et essais sur rendez-vous · vendeurs identifiés
          </p>
        </div>
        <Link href="/vendre" className="btn-pink">
          Déposer une annonce gratuite
        </Link>
      </div>
      <Suspense>
        <Filters />
      </Suspense>
      <div className="mt-6">
        <ListingGrid listings={items} />
      </div>
      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={pageLink(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-primary text-white" : "bg-white text-ink hover:bg-primary-soft"}`} aria-current={p === page ? "page" : undefined}>
              {p}
            </Link>
          ))}
        </nav>
      )}
      <aside className="mt-10 rounded-2xl border border-pink/60 bg-pink-soft/50 p-5 text-sm">
        <p className="font-semibold text-[#8a2f40]">Rappel sécurité</p>
        <p className="mt-1 text-ink/80">
          Ne versez jamais d&apos;acompte ni de frais de transport avant d&apos;avoir vu le cheval et lu sa puce. Faites réaliser une visite vétérinaire d&apos;achat par le vétérinaire de votre choix.{" "}
          <Link href="/guides/eviter-les-arnaques" className="text-primary underline">
            Lire le guide anti-arnaques
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}

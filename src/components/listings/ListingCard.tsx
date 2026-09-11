import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck, Stethoscope, CalendarCheck } from "lucide-react";
import type { Listing } from "@/lib/types";
import { ageLabel, formatPrice, LEVELS, ROLES, SEXES } from "@/lib/constants";

export function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos[0];
  return (
    <article className="card group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/chevaux/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
          {photo ? (
            <Image src={photo} alt={listing.horse_name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Pas de photo</div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {listing.status === "reserved" && <span className="tag bg-amber-100 text-amber-800">Réservé</span>}
            {listing.status === "sold" && <span className="tag bg-ink text-white">Vendu</span>}
            {listing.is_depot_vente && <span className="tag bg-white/90 text-primary">Dépôt-vente</span>}
            {listing.featured && <span className="tag-pink">À la une</span>}
          </div>
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-semibold text-primary shadow-sm">
            {formatPrice(listing.price, { hidden: listing.price_hidden })}
            {listing.price_negotiable && !listing.price_hidden && <span className="ml-1 text-[10px] font-normal text-muted">à débattre</span>}
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink group-hover:text-primary">{listing.title}</h3>
          <p className="mt-1.5 text-sm text-muted">
            {listing.breed} · {SEXES[listing.sex]} · {ageLabel(listing.birth_year)}
            {listing.height_cm ? ` · ${listing.height_cm} cm` : ""}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {listing.disciplines.slice(0, 3).map((d) => (
              <span key={d} className="tag-primary">
                {d}
              </span>
            ))}
            <span className="tag-neutral">{LEVELS[listing.level]}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {listing.city} ({listing.region})
            </span>
            <span className="inline-flex items-center gap-2">
              {listing.xrays_available && (
                <span title="Radios disponibles">
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
              {listing.trial_available && (
                <span title="Essai possible">
                  <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
              {listing.seller?.is_verified && (
                <span title="Vendeur vérifié">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
            </span>
          </div>
          {listing.seller && (
            <p className="mt-2 text-xs text-muted">
              {ROLES[listing.seller.role].short} · {listing.seller.display_name}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ListingGrid({ listings, empty }: { listings: Listing[]; empty?: string }) {
  if (!listings.length) return <p className="card p-8 text-center text-sm text-muted">{empty ?? "Aucune annonce ne correspond à votre recherche."}</p>;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}


import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, CalendarCheck, FileText, MapPin, ShieldCheck, Stethoscope, Video } from "lucide-react";
import { getListingBySlug, getSimilarListings } from "@/lib/listings";
import { ageLabel, formatPrice, LEVELS, PAPERS, ROLES, SEXES } from "@/lib/constants";
import { Gallery } from "@/components/listings/Gallery";
import { VisitRequestForm } from "@/components/listings/VisitRequestForm";
import { ContactSeller } from "@/components/listings/ContactSeller";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ListingGrid } from "@/components/listings/ListingCard";
import { canContact, getCurrentSubscription, getCurrentUser, planOf } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { reportListing } from "@/app/actions/favorites";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) return { title: "Annonce introuvable" };
  return {
    title: l.title,
    description: `${l.breed}, ${SEXES[l.sex].toLowerCase()}, ${ageLabel(l.birth_year)}${l.height_cm ? `, ${l.height_cm} cm` : ""} – ${formatPrice(l.price, { hidden: l.price_hidden })} – ${l.city}. ${l.description.slice(0, 140)}`,
    openGraph: { images: l.photos[0] ? [l.photos[0]] : [] },
  };
}

function toEmbed(url: string) {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();
  const [user, sub, similar] = await Promise.all([getCurrentUser(), getCurrentSubscription(), getSimilarListings(listing)]);
  const plan = planOf(sub);
  const isOwner = user?.id === listing.seller_id;

  let isFavorite = false;
  const supabase = await createClient();
  if (supabase && user) {
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", listing.id).maybeSingle();
    isFavorite = Boolean(data);
    if (!isOwner) await supabase.rpc("increment_listing_views", { p_listing: listing.id });
  }

  const facts: [string, string | null][] = [
    ["Race", listing.breed],
    ["Sexe", SEXES[listing.sex]],
    ["Âge", `${ageLabel(listing.birth_year)} (${listing.birth_year})`],
    ["Taille", listing.height_cm ? `${listing.height_cm} cm` : null],
    ["Robe", listing.color],
    ["Niveau", LEVELS[listing.level]],
    ["Père", listing.sire_name],
    ["Mère", listing.dam_name ? `${listing.dam_name}${listing.dam_sire_name ? ` (par ${listing.dam_sire_name})` : ""}` : null],
    ["Papiers", PAPERS[listing.papers]],
    ["N° SIRE", listing.sire_number ? listing.sire_number.replace(/(.{4})(?=.)/g, "$1 ") : null],
    ["Approuvé stud-book", listing.studbook_approved ? "Oui" : null],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-xs text-muted" aria-label="Fil d'Ariane">
        <Link href="/chevaux" className="hover:text-primary">
          Chevaux à vendre
        </Link>{" "}
        / {listing.horse_name}
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Gallery photos={listing.photos} alt={listing.horse_name} />
          <div className="mt-6 flex flex-wrap gap-2">
            {listing.status === "reserved" && <span className="tag bg-amber-100 text-amber-800">Réservé</span>}
            {listing.status === "sold" && <span className="tag bg-ink text-white">Vendu</span>}
            {listing.is_depot_vente && <span className="tag-primary">En dépôt-vente{listing.owner_name ? ` · ${listing.owner_name}` : ""}</span>}
            {listing.disciplines.map((d) => (
              <span key={d} className="tag-primary">
                {d}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{listing.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" /> {listing.city}
            {listing.postal_code ? ` (${listing.postal_code.slice(0, 2)})` : ""} · {listing.region}
          </p>

          <div className="card mt-6 grid gap-x-8 gap-y-3 p-5 sm:grid-cols-2">
            {facts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-2 text-sm last:border-0 sm:[&:nth-last-child(2)]:border-0">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Badge ok={listing.visit_available} icon={CalendarCheck} label="Visite sur rendez-vous" />
            <Badge ok={listing.trial_available} icon={CalendarCheck} label="Essai monté possible" />
            <Badge ok={listing.vet_check_available} icon={Stethoscope} label="Visite vétérinaire acceptée" />
            <Badge ok={listing.xrays_available} icon={Stethoscope} label="Radios disponibles" />
          </div>

          <section className="prose-cv mt-8">
            <h2>Description</h2>
            {listing.description.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
            {listing.temperament && (
              <>
                <h3>Tempérament et mode de vie</h3>
                <p>{listing.temperament}</p>
              </>
            )}
            {listing.competition_results && (
              <>
                <h3>Résultats</h3>
                <p>{listing.competition_results}</p>
              </>
            )}
            {(listing.health_notes || listing.known_vices) && (
              <>
                <h3>Santé et particularités déclarées</h3>
                {listing.health_notes && <p>{listing.health_notes}</p>}
                {listing.known_vices && <p>{listing.known_vices}</p>}
              </>
            )}
            {!listing.health_notes && !listing.known_vices && (
              <p className="text-sm text-muted">Le vendeur n&apos;a déclaré aucun antécédent ni particularité. Demandez-lui confirmation par écrit et faites réaliser une visite vétérinaire d&apos;achat.</p>
            )}
          </section>

          {listing.video_urls.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-primary">
                <Video className="h-5 w-5" /> Vidéos
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {listing.video_urls.map((u) => {
                  const e = toEmbed(u);
                  return e ? (
                    <div key={u} className="aspect-video overflow-hidden rounded-xl bg-ink">
                      <iframe src={e} title="Vidéo du cheval" className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
                    </div>
                  ) : (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="card block p-4 text-sm text-primary underline">
                      {u}
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-8 rounded-2xl border border-pink/60 bg-pink-soft/40 p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold text-[#8a2f40]">
              <AlertTriangle className="h-4 w-4" /> Avant d&apos;acheter
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
              <li>Voyez le cheval à froid, montez après le vendeur, revenez 2 à 3 fois si besoin.</li>
              <li>Faites lire la puce et vérifiez la carte d&apos;immatriculation au nom du vendeur (ou le mandat de dépôt-vente).</li>
              <li>Visite vétérinaire d&apos;achat par votre vétérinaire, en condition suspensive du contrat.</li>
              <li>Aucun acompte avant d&apos;avoir vu le cheval. Paiement uniquement contre contrat signé.</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/contrats/vente" className="btn-neutral !py-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Contrat de vente type
              </Link>
              <Link href="/guides/acheteurs" className="btn-ghost !py-1.5 text-xs">
                Guide de l&apos;acheteur
              </Link>
            </div>
          </section>
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <p className="text-3xl font-semibold text-primary">{formatPrice(listing.price, { hidden: listing.price_hidden })}</p>
            <p className="mt-1 text-xs text-muted">
              {listing.price_hidden ? "Le vendeur communique le prix sur demande." : listing.vat_included ? "TTC" : "HT (vendeur assujetti à la TVA)"}
              {listing.price_negotiable && !listing.price_hidden ? " · à débattre" : ""}
            </p>
            {listing.seller && (
              <div className="mt-4 flex items-start gap-3 border-t border-line pt-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">{listing.seller.display_name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">
                    {listing.seller.slug ? (
                      <Link href={`/pros/${listing.seller.slug}`} className="hover:text-primary">
                        {listing.seller.display_name}
                      </Link>
                    ) : (
                      listing.seller.display_name
                    )}
                  </p>
                  <p className="text-muted">{ROLES[listing.seller.role].label}</p>
                  {listing.seller.is_verified && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" /> Professionnel vérifié (SIRET)
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 space-y-2">
              <ContactSeller listingId={listing.id} sellerId={listing.seller_id} loggedIn={Boolean(user)} canContact={canContact(plan)} isOwner={isOwner} />
              <FavoriteButton listingId={listing.id} slug={listing.slug} initial={isFavorite} />
            </div>
          </div>

          {!isOwner && listing.status === "active" && listing.visit_available && (
            <div className="card p-5">
              <h2 className="font-semibold">Demander une visite ou un essai</h2>
              <p className="mb-3 mt-1 text-xs text-muted">Gratuit et sans abonnement.</p>
              <VisitRequestForm listingId={listing.id} sellerId={listing.seller_id} trialAvailable={listing.trial_available} loggedIn={Boolean(user)} />
            </div>
          )}

          <details className="card p-4 text-sm">
            <summary className="cursor-pointer font-medium text-muted">Signaler cette annonce</summary>
            {user ? (
              <form action={reportListing} className="mt-3 space-y-2">
                <input type="hidden" name="listingId" value={listing.id} />
                <select name="reason" className="input" required>
                  <option value="">Motif</option>
                  <option>Suspicion d&apos;arnaque</option>
                  <option>Photos ou informations trompeuses</option>
                  <option>Cheval déjà vendu</option>
                  <option>Maltraitance présumée</option>
                  <option>Autre</option>
                </select>
                <textarea name="details" rows={3} className="input" placeholder="Précisions (facultatif)" />
                <button className="btn-neutral w-full" type="submit">
                  Envoyer le signalement
                </button>
              </form>
            ) : (
              <p className="mt-2 text-xs text-muted">Connectez-vous pour signaler une annonce.</p>
            )}
          </details>
          <p className="text-xs text-muted">Annonce vue {listing.views_count} fois · publiée le {new Date(listing.published_at ?? listing.created_at).toLocaleDateString("fr-FR")}</p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-semibold">Annonces similaires</h2>
          <ListingGrid listings={similar} />
        </section>
      )}
    </div>
  );
}

function Badge({ ok, icon: Icon, label }: { ok: boolean; icon: typeof CalendarCheck; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${ok ? "bg-primary-soft text-primary" : "bg-sand text-muted line-through"}`}>
      <Icon className="h-4 w-4" /> {label}
    </span>
  );
}

"use client";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";

export function FavoriteButton({ listingId, slug, initial }: { listingId: string; slug: string; initial: boolean }) {
  const [fav, setFav] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await toggleFavorite(listingId, slug);
          if (r.ok) setFav(Boolean(r.favorite));
          else if (r.auth) window.location.href = `/connexion?next=/chevaux/${slug}`;
        })
      }
      className={`btn-neutral ${fav ? "!border-pink !text-[#8a2f40]" : ""}`}
      aria-pressed={fav}
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-pink" : ""}`} /> {fav ? "Dans mes favoris" : "Ajouter aux favoris"}
    </button>
  );
}

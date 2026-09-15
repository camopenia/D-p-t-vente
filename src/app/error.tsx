"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Oups</p>
      <h1 className="mt-2 text-2xl font-semibold">Cette page n&apos;a pas pu s&apos;afficher</h1>
      <p className="mt-3 text-sm text-muted">
        Un problème temporaire est survenu, souvent lié à la base de données. Réessayez dans quelques secondes : rien n&apos;a été perdu.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Réessayer
        </button>
        <Link href="/" className="btn-neutral">
          Retour à l&apos;accueil
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted">Référence : {error.digest}</p>}
    </div>
  );
}

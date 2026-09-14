/**
 * Adresse publique du site, tolérante aux valeurs saisies sans « https:// » ou avec une barre finale.
 * Une valeur invalide ne doit jamais faire tomber le site : on retombe sur l'adresse par défaut.
 */
const DEFAULT = "https://vente.cavalons.fr";

export function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return DEFAULT;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return DEFAULT;
  }
}

export function siteUrlObject(): URL {
  return new URL(siteUrl());
}

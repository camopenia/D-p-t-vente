/**
 * fetch avec nouvelle tentative pour les requêtes de lecture (GET/HEAD) : l'API Supabase répond parfois 502/503/504
 * après ~5 s quand l'instance gratuite est froide. Les écritures ne sont jamais rejouées automatiquement
 * (risque de doublon) : chaque action serveur gère son propre cas.
 */
const RETRY_STATUS = new Set([502, 503, 504]);
const DELAYS_MS = [600, 1500];

export const fetchWithRetry: typeof fetch = async (input, init) => {
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const idempotent = method === "GET" || method === "HEAD";
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= (idempotent ? DELAYS_MS.length : 0); attempt++) {
    try {
      const res = await fetch(input, init);
      if (!idempotent || !RETRY_STATUS.has(res.status) || attempt === DELAYS_MS.length) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
      if (!idempotent || attempt === DELAYS_MS.length) throw err;
    }
    await new Promise((r) => setTimeout(r, DELAYS_MS[attempt]));
  }
  throw lastError instanceof Error ? lastError : new Error("fetch failed");
};

/** Message lisible pour l'utilisateur à partir d'une erreur Supabase / réseau. */
export function friendlyDbError(message: string | undefined | null): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("gateway timeout") || m.includes("timeout") || m.includes("fetch failed") || m.includes("bad gateway") || m.includes("service unavailable") || m.includes("<html")) {
    return "La base de données a mis trop de temps à répondre. Réessayez dans quelques secondes : votre saisie est conservée.";
  }
  if (m.includes("row-level security") || m.includes("policy")) return "Action non autorisée pour votre compte.";
  return message || "Une erreur est survenue. Réessayez.";
}

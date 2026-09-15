import type { Instrumentation } from "next";

/**
 * Journalise chaque erreur serveur non gérée avec son digest : c'est ce digest que Next.js affiche
 * à l'utilisateur (« Digest: 1234567890 »). Dans les logs Vercel, chercher « [erreur-serveur] ».
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const e = err as { message?: string; stack?: string; digest?: string; cause?: unknown };
  console.error(
    "[erreur-serveur]",
    JSON.stringify({
      digest: e.digest ?? null,
      message: e.message ?? String(err),
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
      cause: e.cause instanceof Error ? e.cause.message : e.cause ?? null,
      stack: (e.stack ?? "").split("\n").slice(0, 8).join(" | "),
    }),
  );
};

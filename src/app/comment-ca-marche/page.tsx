import type { Metadata } from "next";
import { COMMENT_CA_MARCHE } from "@/lib/content/pages";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "Comment ça marche", description: "Le fonctionnement de Cavalons Ventes pour les acheteurs, vendeurs, éleveurs et professionnels." };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Comment ça marche</h1>
      <p className="mt-2 text-muted">Gratuit pour chercher, publier, visiter et essayer. Abonnement pour contacter directement les vendeurs.</p>
      <div className="prose-cv card mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(COMMENT_CA_MARCHE) }} />
    </div>
  );
}

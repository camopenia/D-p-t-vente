import type { Metadata } from "next";
import { CONFIDENTIALITE } from "@/lib/content/pages";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "Politique de confidentialité", description: "Comment Cavalons Ventes traite vos données personnelles." };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
      <p className="mt-2 text-muted">Vos données, vos droits, nos sous-traitants.</p>
      <div className="prose-cv card mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(CONFIDENTIALITE) }} />
    </div>
  );
}

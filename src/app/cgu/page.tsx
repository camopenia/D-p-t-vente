import type { Metadata } from "next";
import { CGU } from "@/lib/content/pages";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "Conditions générales d'utilisation", description: "Conditions générales d'utilisation de la plateforme Cavalons Ventes." };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Conditions générales d&apos;utilisation</h1>
      <p className="mt-2 text-muted">Version projet, à faire valider par un juriste avant mise en production.</p>
      <div className="prose-cv card mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(CGU) }} />
    </div>
  );
}

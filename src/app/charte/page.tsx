import type { Metadata } from "next";
import { CHARTE } from "@/lib/content/pages";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = { title: "Pacte de bonne conduite", description: "Les engagements de tous les membres de Cavalons Ventes pour des ventes de chevaux sûres et transparentes." };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Pacte de bonne conduite</h1>
      <p className="mt-2 text-muted">Accepté par chaque membre à l&apos;inscription. Sécurité, transparence, bien-être du cheval.</p>
      <div className="prose-cv card mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(CHARTE) }} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/content/guides";
import { renderMarkdown } from "@/lib/markdown";
import { ROLES } from "@/lib/constants";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  return g ? { title: g.title, description: g.summary } : { title: "Guide introuvable" };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.slug !== slug).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-xs text-muted">
        <Link href="/guides" className="hover:text-primary">
          Guides
        </Link>{" "}
        / {guide.audience === "tous" ? "Pour tous" : ROLES[guide.audience].label}
      </nav>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="card p-6 sm:p-10">
          <span className="tag-primary">{guide.audience === "tous" ? "Pour tous" : ROLES[guide.audience].label}</span>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{guide.title}</h1>
          <p className="mt-2 text-muted">{guide.summary}</p>
          <div className="prose-cv mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.body) }} />
        </article>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <h2 className="font-semibold">Outils</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/contrats/vente" className="text-primary underline">
                  Contrat de vente
                </Link>
              </li>
              <li>
                <Link href="/contrats/essai" className="text-primary underline">
                  Convention d&apos;essai
                </Link>
              </li>
              <li>
                <Link href="/contrats/depot-vente" className="text-primary underline">
                  Mandat de dépôt-vente
                </Link>
              </li>
              <li>
                <Link href="/chevaux" className="text-primary underline">
                  Chevaux à vendre
                </Link>
              </li>
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Autres guides</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="hover:text-primary">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

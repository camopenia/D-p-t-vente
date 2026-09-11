import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContractBuilder } from "@/components/contracts/ContractBuilder";
import { CONTRACT_TEMPLATES } from "@/lib/content/contracts";

export function generateStaticParams() {
  return Object.keys(CONTRACT_TEMPLATES).map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const t = CONTRACT_TEMPLATES[type];
  return t ? { title: t.title, description: t.intro } : { title: "Contrat introuvable" };
}

export default async function ContratPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const template = CONTRACT_TEMPLATES[type];
  if (!template) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="no-print mb-4 text-xs text-muted">
        <Link href="/contrats" className="hover:text-primary">
          Modèles de contrats
        </Link>{" "}
        / {template.title}
      </nav>
      <div className="no-print mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">{template.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{template.intro}</p>
      </div>
      <ContractBuilder templateId={template.id} />
    </div>
  );
}

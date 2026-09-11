import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/ui/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/constants";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function InscriptionPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  if (await getCurrentUser()) redirect("/mon-compte");
  const valid: Role[] = ["acheteur", "particulier", "eleveur", "pro_depot"];
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold">Créer un compte</h1>
      <p className="mt-1 text-sm text-muted">Gratuit. Publiez des annonces, demandez des visites et essais, générez vos contrats.</p>
      <div className="card mt-6 p-6">
        <SignUpForm defaultRole={valid.includes(role as Role) ? (role as Role) : "acheteur"} />
      </div>
    </div>
  );
}

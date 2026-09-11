import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/ui/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/mon-compte", error } = await searchParams;
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-muted">Retrouvez vos annonces, vos demandes de visite et vos messages.</p>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Le lien utilisé est invalide ou expiré.</p>}
      <div className="card mt-6 p-6">
        <SignInForm next={next} />
      </div>
    </div>
  );
}

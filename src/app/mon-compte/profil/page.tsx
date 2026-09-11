export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { ProfileForm } from "@/components/ui/ProfileForm";
import { requireAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilPage() {
  const { profile, plan } = await requireAccount();
  return (
    <AccountShell profile={profile} plan={plan} title="Mon profil">
      {profile ? <ProfileForm profile={profile} /> : <p className="text-sm text-muted">Profil introuvable.</p>}
    </AccountShell>
  );
}

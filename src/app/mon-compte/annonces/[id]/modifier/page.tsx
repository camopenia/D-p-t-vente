import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { ListingForm } from "@/components/listings/ListingForm";
import { requireAccount } from "@/lib/account";
import { getListingById } from "@/lib/listings";

export const metadata: Metadata = { title: "Modifier l'annonce" };

export default async function ModifierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, plan, userId } = await requireAccount();
  const listing = await getListingById(id);
  if (!listing || listing.seller_id !== userId) notFound();
  const isPro = profile?.role === "eleveur" || profile?.role === "pro_depot";
  return (
    <AccountShell profile={profile} plan={plan} title={`Modifier : ${listing.horse_name}`}>
      <ListingForm userId={userId} isPro={Boolean(isPro)} existing={listing} />
    </AccountShell>
  );
}

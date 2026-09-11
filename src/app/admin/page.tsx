export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminStats, requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

export default async function AdminPage() {
  const { demo } = await requireAdmin();
  const s = await getAdminStats();
  const tiles: [string, number, string, boolean][] = [
    ["Annonces à valider", s.listings_pending, "/admin/annonces?status=pending", s.listings_pending > 0],
    ["Signalements ouverts", s.reports_open, "/admin/signalements", s.reports_open > 0],
    ["Pros à vérifier (SIRET)", s.pros_to_verify, "/admin/professionnels?filter=to_verify", s.pros_to_verify > 0],
    ["Annonces en ligne", s.listings_active, "/admin/annonces?status=active", false],
    ["Annonces vendues", s.listings_sold, "/admin/annonces?status=sold", false],
    ["Membres", s.users, "/admin/utilisateurs", false],
    ["Professionnels", s.pros, "/admin/professionnels", false],
    ["Abonnements payants", s.paid_subscriptions, "/admin/utilisateurs", false],
    ["Demandes de visite (30 j)", s.visits_30d, "/admin", false],
  ];
  return (
    <AdminShell title="Tableau de bord" demo={demo}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([label, value, href, alert]) => (
          <Link key={label} href={href} className={`card p-4 hover:border-primary ${alert ? "border-pink bg-pink-soft/40" : ""}`}>
            <p className={`text-3xl font-semibold ${alert ? "text-[#8a2f40]" : "text-primary"}`}>{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </Link>
        ))}
      </div>
      <div className="card mt-8 p-5 text-sm">
        <h2 className="font-semibold">Règles de modération</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
          <li>Valider une annonce : SIRE présent (sauf ONC), prix affiché, photos du cheval réel, localisation cohérente, description sans mots-clés d&apos;arnaque (« à donner », « transport », « Western Union »).</li>
          <li>Refuser avec un motif clair : le vendeur le voit dans « Mes annonces » et peut corriger puis republier.</li>
          <li>Signalement : vérifier l&apos;annonce, contacter le vendeur si doute, retirer si arnaque probable, bloquer le compte en cas de fraude avérée.</li>
          <li>Badge « Professionnel vérifié » : contrôler le SIRET sur l&apos;annuaire des entreprises (activité équestre, établissement actif) et la cohérence nom / adresse.</li>
        </ul>
      </div>
    </AdminShell>
  );
}

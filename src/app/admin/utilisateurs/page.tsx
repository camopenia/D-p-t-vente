export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { getProfilesForAdmin, requireAdmin } from "@/lib/admin";
import { moderateProfile } from "@/app/actions/admin";
import { ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "Utilisateurs", robots: { index: false } };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { demo, profile: me } = await requireAdmin();
  const { filter = "all" } = await searchParams;
  const f = filter === "blocked" ? "blocked" : "all";
  const profiles = await getProfilesForAdmin(f);
  return (
    <AdminShell title="Utilisateurs" demo={demo}>
      <div className="mb-4 flex gap-2">
        {[["all", "Tous"], ["blocked", "Bloqués"]].map(([k, l]) => (
          <Link key={k} href={`/admin/utilisateurs?filter=${k}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${f === k ? "bg-primary text-white" : "border border-line bg-white text-muted hover:text-primary"}`}>
            {l}
          </Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-primary-soft text-left text-xs uppercase tracking-wider text-primary">
            <tr>
              <th className="px-3 py-2">Membre</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Inscrit le</th>
              <th className="px-3 py-2">Indicateurs</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2">
                  <p className="font-medium">{p.display_name}</p>
                  <p className="text-xs text-muted">{p.email ?? p.id}</p>
                </td>
                <td className="px-3 py-2 text-xs">{ROLES[p.role].short}</td>
                <td className="px-3 py-2 text-xs">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {p.is_admin && <span className="tag-pink">Admin</span>}
                    {p.is_verified && <span className="tag-primary">Vérifié</span>}
                    {p.is_blocked && <span className="tag bg-red-50 text-red-700">Bloqué</span>}
                    {!p.charter_accepted_at && <span className="tag-neutral">Charte non acceptée</span>}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {!demo && (
                    <form action={moderateProfile} className="flex flex-wrap gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      {p.is_blocked ? (
                        <button name="action" value="unblock" className="btn-neutral !px-2 !py-1 text-xs">
                          Débloquer
                        </button>
                      ) : (
                        p.id !== me?.id && (
                          <button name="action" value="block" className="btn-destructive !px-2 !py-1 text-xs">
                            Bloquer
                          </button>
                        )
                      )}
                      {p.id !== me?.id &&
                        (p.is_admin ? (
                          <button name="action" value="remove_admin" className="btn-ghost !px-2 !py-1 text-xs">
                            Retirer admin
                          </button>
                        ) : (
                          <button name="action" value="make_admin" className="btn-ghost !px-2 !py-1 text-xs">
                            Nommer admin
                          </button>
                        ))}
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Bloquer un membre archive ses annonces en ligne et l&apos;empêche de publier ou de demander des visites. Le journal des actions est conservé dans la table moderation_log.</p>
    </AdminShell>
  );
}

export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { getProfilesForAdmin, requireAdmin } from "@/lib/admin";
import { moderateProfile } from "@/app/actions/admin";
import { ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "Vérification des professionnels", robots: { index: false } };

export default async function AdminProsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { demo } = await requireAdmin();
  const { filter = "to_verify" } = await searchParams;
  const f = filter === "pros" ? "pros" : "to_verify";
  const profiles = await getProfilesForAdmin(f);
  return (
    <AdminShell title="Professionnels" demo={demo}>
      <div className="mb-4 flex gap-2">
        {[["to_verify", "À vérifier (SIRET saisi)"], ["pros", "Tous les pros"]].map(([k, l]) => (
          <Link key={k} href={`/admin/professionnels?filter=${k}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${f === k ? "bg-primary text-white" : "border border-line bg-white text-muted hover:text-primary"}`}>
            {l}
          </Link>
        ))}
      </div>
      {profiles.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">Aucun profil.</p>
      ) : (
        <ul className="space-y-3">
          {profiles.map((p) => (
            <li key={p.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {p.display_name} {p.company_name ? <span className="font-normal text-muted">· {p.company_name}</span> : null}
                  </p>
                  <p className="text-xs text-muted">
                    {ROLES[p.role].label} · {p.city ?? "—"} {p.region ? `(${p.region})` : ""} · {p.email ?? ""} · {p.phone ?? "pas de téléphone"}
                  </p>
                  <p className="mt-1 text-xs">
                    SIRET : <span className="font-mono">{p.siret ?? "non renseigné"}</span>
                    {p.siret && (
                      <>
                        {" "}
                        ·{" "}
                        <a href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${p.siret}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Vérifier sur l&apos;annuaire des entreprises
                        </a>
                      </>
                    )}
                  </p>
                  {p.verification_note && <p className="mt-1 text-xs text-muted">Note : {p.verification_note}</p>}
                </div>
                <div className="flex gap-2">
                  {p.is_verified && <span className="tag-primary">Vérifié</span>}
                  {p.is_blocked && <span className="tag bg-red-50 text-red-700">Bloqué</span>}
                  {p.slug && (
                    <Link href={`/pros/${p.slug}`} target="_blank" className="text-xs text-primary underline">
                      Page publique
                    </Link>
                  )}
                </div>
              </div>
              {!demo && (
                <form action={moderateProfile} className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center">
                  <input type="hidden" name="id" value={p.id} />
                  <input name="note" className="input flex-1" placeholder="Note interne (ex. SIRET contrôlé le …)" />
                  {p.is_verified ? (
                    <button name="action" value="unverify" className="btn-neutral !py-1.5 text-xs">
                      Retirer le badge
                    </button>
                  ) : (
                    <button name="action" value="verify" className="btn-primary !py-1.5 text-xs">
                      Attribuer le badge vérifié
                    </button>
                  )}
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

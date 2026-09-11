export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { getReports, requireAdmin } from "@/lib/admin";
import { resolveReport } from "@/app/actions/admin";
import { LISTING_STATUS } from "@/lib/constants";

export const metadata: Metadata = { title: "Signalements", robots: { index: false } };

export default async function AdminSignalementsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { demo } = await requireAdmin();
  const { status = "open" } = await searchParams;
  const reports = await getReports(status);
  return (
    <AdminShell title="Signalements" demo={demo}>
      <div className="mb-4 flex gap-2">
        {[["open", "Ouverts"], ["resolved", "Traités"], ["dismissed", "Sans suite"], ["all", "Tous"]].map(([k, l]) => (
          <Link key={k} href={`/admin/signalements?status=${k}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === k ? "bg-primary text-white" : "border border-line bg-white text-muted hover:text-primary"}`}>
            {l}
          </Link>
        ))}
      </div>
      {reports.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">Aucun signalement.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.reason}</p>
                  <p className="text-xs text-muted">
                    Par {r.reporter?.display_name ?? "membre supprimé"} · le {new Date(r.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <span className="tag-neutral">{r.status === "open" ? "Ouvert" : r.status === "resolved" ? "Traité" : "Sans suite"}</span>
              </div>
              {r.details && <p className="mt-2 rounded-lg bg-sand p-3">{r.details}</p>}
              {r.listing ? (
                <p className="mt-2">
                  Annonce :{" "}
                  <Link href={`/chevaux/${r.listing.slug}`} target="_blank" className="text-primary underline">
                    {r.listing.title}
                  </Link>{" "}
                  <span className="tag-neutral">{LISTING_STATUS[r.listing.status]}</span>
                </p>
              ) : (
                <p className="mt-2 text-muted">Annonce supprimée.</p>
              )}
              {r.resolution_note && <p className="mt-2 text-xs text-muted">Décision : {r.resolution_note}</p>}
              {!demo && r.status === "open" && (
                <form action={resolveReport} className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="listingId" value={r.listing?.id ?? ""} />
                  <input name="note" className="input flex-1" placeholder="Note de décision" />
                  {r.listing && (r.listing.status === "active" || r.listing.status === "reserved") && (
                    <button name="action" value="archive_listing" className="btn-destructive !py-1.5 text-xs">
                      Retirer l&apos;annonce
                    </button>
                  )}
                  <button name="action" value="resolve" className="btn-primary !py-1.5 text-xs">
                    Marquer traité
                  </button>
                  <button name="action" value="dismiss" className="btn-neutral !py-1.5 text-xs">
                    Sans suite
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

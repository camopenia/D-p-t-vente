import Link from "next/link";
import { AdminNav } from "./AdminNav";

export function AdminShell({ title, demo, children }: { title: string; demo: boolean; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Back-office de modération</p>
        <Link href="/mon-compte" className="text-xs text-muted hover:text-primary">
          ← Mon espace
        </Link>
      </div>
      {demo && <p className="mb-4 rounded-lg bg-pink-soft p-3 text-xs text-[#8a2f40]">Mode démonstration : données fictives, actions désactivées. Configurez Supabase puis nommez un administrateur (voir README).</p>}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0">
          <AdminNav />
        </div>
        <section className="min-w-0">
          <h1 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  );
}

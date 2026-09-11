import Link from "next/link";
import { AdminNav } from "./AdminNav";

export function AdminShell({ title, demo, children }: { title: string; demo: boolean; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Back-office de modération</p>
        <Link href="/mon-compte" className="text-xs text-muted hover:text-primary">
          ← Mon espace
        </Link>
      </div>
      {demo && <p className="mb-4 rounded-lg bg-pink-soft p-3 text-xs text-[#8a2f40]">Mode démonstration : données fictives, actions désactivées. Configurez Supabase puis nommez un administrateur (voir README).</p>}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AdminNav />
        <section>
          <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  );
}

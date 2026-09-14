import { AccountNav } from "./AccountNav";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";
import { ROLES, PLANS, type PlanId } from "@/lib/constants";
import { LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function AccountShell({ profile, plan, children, title }: { profile: Profile | null; plan: PlanId; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-2 p-4 lg:block">
            <div className="min-w-0">
              <p className="truncate font-semibold">{profile?.display_name ?? "Visiteur"}</p>
              <p className="text-xs text-muted">{profile ? ROLES[profile.role].label : "Mode démonstration"}</p>
            </div>
            <span className="tag-primary shrink-0 lg:mt-2">Plan {PLANS[plan].name}</span>
          </div>
          <AccountNav />
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
            {profile?.is_admin && (
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-pink bg-pink-soft/60 px-3 py-2 text-sm font-medium text-[#8a2f40]">
                <ShieldCheck className="h-4 w-4" /> Administration
              </Link>
            )}
            <form action={signOut} className="lg:w-full">
              <button type="submit" className="btn-ghost justify-start text-sm lg:w-full">
                <LogOut className="h-4 w-4" /> Se déconnecter
              </button>
            </form>
          </div>
        </aside>
        <section className="min-w-0">
          <h1 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  );
}

import { AccountNav } from "./AccountNav";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";
import { ROLES, PLANS, type PlanId } from "@/lib/constants";
import { LogOut } from "lucide-react";

export function AccountShell({ profile, plan, children, title }: { profile: Profile | null; plan: PlanId; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div className="card p-4">
            <p className="font-semibold">{profile?.display_name ?? "Visiteur"}</p>
            <p className="text-xs text-muted">{profile ? ROLES[profile.role].label : "Mode démonstration"}</p>
            <span className="tag-primary mt-2">Plan {PLANS[plan].name}</span>
          </div>
          <AccountNav />
          <form action={signOut}>
            <button type="submit" className="btn-ghost w-full justify-start text-sm">
              <LogOut className="h-4 w-4" /> Se déconnecter
            </button>
          </form>
        </aside>
        <section>
          <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  );
}

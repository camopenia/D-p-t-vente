"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, LayoutDashboard, ListChecks, ShieldCheck, Users } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/annonces", label: "Annonces", icon: ListChecks },
  { href: "/admin/signalements", label: "Signalements", icon: Flag },
  { href: "/admin/professionnels", label: "Professionnels", icon: ShieldCheck },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="-mx-4 flex w-[calc(100%+2rem)] min-w-0 gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:mx-0 lg:w-full lg:flex-col lg:px-0 lg:pb-0" style={{ scrollbarWidth: "thin" }} aria-label="Administration">
      {ITEMS.map((it) => {
        const active = it.href === "/admin" ? path === it.href : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-primary text-white" : "text-ink hover:bg-primary-soft"}`}>
            <it.icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

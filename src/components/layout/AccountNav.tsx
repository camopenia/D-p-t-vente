"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CreditCard, Heart, LayoutDashboard, ListChecks, MessageCircle, UserCircle } from "lucide-react";

const ITEMS = [
  { href: "/mon-compte", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/mon-compte/annonces", label: "Mes annonces", icon: ListChecks },
  { href: "/visites", label: "Visites & essais", icon: CalendarCheck },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/mon-compte/favoris", label: "Favoris", icon: Heart },
  { href: "/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/mon-compte/profil", label: "Profil", icon: UserCircle },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="-mx-4 flex w-[calc(100%+2rem)] min-w-0 gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:mx-0 lg:w-full lg:flex-col lg:px-0 lg:pb-0" style={{ scrollbarWidth: "thin" }} aria-label="Mon espace">
      {ITEMS.map((it) => {
        const active = it.href === "/mon-compte" ? path === it.href : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-primary text-white" : "text-ink hover:bg-primary-soft"}`}>
            <it.icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

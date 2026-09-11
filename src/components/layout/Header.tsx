import Link from "next/link";
import { Logo } from "./Logo";
import { getCurrentUser } from "@/lib/auth";
import { MobileNav } from "./MobileNav";
import { PlusCircle } from "lucide-react";

const NAV = [
  { href: "/chevaux", label: "Chevaux à vendre" },
  { href: "/pros", label: "Éleveurs & pros" },
  { href: "/guides", label: "Guides" },
  { href: "/contrats", label: "Contrats" },
  { href: "/abonnement", label: "Abonnement" },
];

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-primary-soft hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/vendre" className="btn-neutral">
            <PlusCircle className="h-4 w-4" /> Déposer une annonce
          </Link>
          {user ? (
            <Link href="/mon-compte" className="btn-primary">
              Mon espace
            </Link>
          ) : (
            <Link href="/connexion" className="btn-primary">
              Connexion
            </Link>
          )}
        </div>
        <MobileNav nav={NAV} loggedIn={Boolean(user)} />
      </div>
    </header>
  );
}

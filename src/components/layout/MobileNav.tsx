"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ nav, loggedIn }: { nav: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-ink hover:bg-primary-soft" aria-expanded={open} aria-label="Menu">
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-line bg-white p-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-primary-soft">
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
              <Link href="/vendre" onClick={() => setOpen(false)} className="btn-neutral">
                Déposer une annonce
              </Link>
              <Link href={loggedIn ? "/mon-compte" : "/connexion"} onClick={() => setOpen(false)} className="btn-primary">
                {loggedIn ? "Mon espace" : "Connexion"}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

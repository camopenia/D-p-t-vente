import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Cavalons Ventes – accueil">
      <Image src={light ? "/brand/logo-mark-white.svg" : "/brand/logo-mark.svg"} alt="" width={40} height={36} priority className="h-9 w-auto" />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className={`text-xl font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>Cavalons</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${light ? "bg-white/15 text-white" : "bg-pink-soft text-[#8a2f40]"}`}>
          Ventes
        </span>
      </span>
    </Link>
  );
}

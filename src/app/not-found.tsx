import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <Image src="/brand/mascotte-amoureux.png" alt="" width={200} height={280} className="h-56 w-auto" />
      <h1 className="mt-6 text-2xl font-semibold">Cette page a pris la clé des champs</h1>
      <p className="mt-2 text-muted">L&apos;annonce a peut-être été vendue ou retirée.</p>
      <Link href="/chevaux" className="btn-primary mt-6">
        Voir les chevaux à vendre
      </Link>
    </div>
  );
}

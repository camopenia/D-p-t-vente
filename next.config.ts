import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  // Le domaine public peut être servi via un proxy qui réécrit l'hôte vers l'adresse *.vercel.app :
  // on autorise explicitement ces origines pour les actions serveur (formulaires), sinon Next.js
  // refuse la requête (« x-forwarded-host does not match origin »).
  experimental: {
    serverActions: {
      allowedOrigins: ["vente.cavalons.fr", "www.vente.cavalons.fr", "*.vercel.app", "localhost:3000", "localhost:3100"],
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;

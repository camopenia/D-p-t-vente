import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { siteUrlObject } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cavalons Ventes – Chevaux et poneys à vendre en toute confiance",
    template: "%s | Cavalons Ventes",
  },
  description:
    "Annonces de chevaux à vendre par des éleveurs, particuliers et professionnels du dépôt-vente. Visites et essais, contrats de vente, guides pour acheter et vendre sereinement.",
  metadataBase: siteUrlObject(),
  openGraph: { siteName: "Cavalons Ventes", locale: "fr_FR", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="min-h-screen antialiased flex flex-col">
        <DemoBanner />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.stanandwill.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Stan & Will, la prévention santé des petits chiens",
  description:
    "Dos, souffle, dents, cœur : chaque petite race a ses points faibles. Stan & Will vous dit quoi surveiller chez votre chien, semaine après semaine. Bilan gratuit, 2 mois offerts sur l'abonnement annuel.",
  openGraph: {
    title: "Stan & Will, la prévention santé des petits chiens",
    description:
      "Un petit chien cache longtemps quand ça ne va pas. Apprenez à le voir avant : bilan par race, gestes de prévention, balades, carnet de santé.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: [{ url: "/favicon.png", sizes: "48x48" }, { url: "/icon-192.png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#1E5B45", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

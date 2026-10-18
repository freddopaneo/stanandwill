import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://stanandwill.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Stan & Will — l'app qui veille sur votre teckel",
  description:
    "Dos, poids, assiette : le compagnon santé de votre teckel, validé par des vétérinaires. Lancement décembre 2026. Les 500 premiers inscrits paient 29,99 € la première année.",
  openGraph: {
    title: "Stan & Will — l'app qui veille sur votre teckel",
    description:
      "Stan a 7 ans, Will en a 3. L'un a passé l'âge critique, l'autre y entre. On a construit l'app qu'on aurait voulu avoir pour eux.",
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

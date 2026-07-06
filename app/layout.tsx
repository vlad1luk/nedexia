import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Voix d'Eden — serif chaleureuse réservée au tuteur (brief, messages). */
const fraunces = Fraunces({
  variable: "--font-eden",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "Nedexia — Le tuteur de croissance des PME québécoises",
  description:
    "Nedexia accompagne les dirigeants de PME québécoises qui veulent grandir, se structurer, s'allier ou transmettre leur entreprise. Eden, votre tuteur de croissance, vous prépare puis vous connecte à des entreprises réellement compatibles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

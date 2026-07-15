import { Fraunces } from "next/font/google";

/**
 * Serif d'affichage — carnet de terrain / grand livre — scopé à
 * /financement uniquement (n'affecte pas la typographie sans-serif du
 * reste du site). Appliqué via `fraunces.variable` sur le wrapper de page ;
 * consommé par l'utilitaire `font-ledger` (voir app/globals.css).
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

import type { Metadata } from "next";

import { fraunces } from "./fonts";
import { FinancementHero } from "./financement-hero";
import { DiagnosticFinancement } from "./diagnostic-financement";
import {
  CasReels,
  CeQueVousRecevez,
  FaqFinancement,
  LaMethode,
} from "./financement-sections";

export const metadata: Metadata = {
  title: "Financement — votre verdict en 10 minutes | Nedexia",
  description:
    "Plus de 2 700 programmes de financement existent pour les entreprises québécoises. En 10 minutes, sans compte, découvrez vos programmes réels, la portion finançable de votre projet et le chemin pour l'obtenir.",
};

/**
 * /financement — nouveau point d'entrée principal (P1, plan août 2026).
 *
 * Identité visuelle propre à cette page — carnet de terrain naturaliste
 * croisé avec un grand livre comptable (encre/parchemin/rouille/laiton,
 * serif Fraunces) — scopée via `fraunces.variable` sur ce wrapper, sans
 * toucher à la typographie ni aux tokens de couleur du reste du site.
 *
 * Règle de parcours non négociable : valeur perçue en 10 secondes (hero),
 * diagnostic sans compte (tunnel inline), verdict affiché immédiatement,
 * capture courriel / espace APRÈS le verdict seulement.
 */
export default function FinancementPage() {
  return (
    <div className={fraunces.variable}>
      <FinancementHero />
      <DiagnosticFinancement />
      <CeQueVousRecevez />
      <LaMethode />
      <CasReels />
      <FaqFinancement />
    </div>
  );
}

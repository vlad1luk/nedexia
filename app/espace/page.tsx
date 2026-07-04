import type { Metadata } from "next";
import EspaceFlow from "./espace-flow";

export const metadata: Metadata = {
  title: "Espace — Diagnostic Eden | Nedexia",
  description:
    "En cinq à sept minutes, Eden évalue la préparation de votre entreprise sur cinq dimensions — clarté, indépendance, finances, structure, réputation — et prépare votre plan d’action. Sans compte, sans document.",
};

export default function EspacePage() {
  return <EspaceFlow />;
}

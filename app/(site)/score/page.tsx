import type { Metadata } from "next";
import ComingSoon from "../components/coming-soon";

export const metadata: Metadata = {
  title: "Score — Nedexia",
  description: "Le score de préparation de votre entreprise, bientôt disponible.",
};

export default function ScorePage() {
  return (
    <ComingSoon
      title="Score"
      description="Votre score de préparation germe encore. Cette page pousse en ce moment même — revenez bientôt."
    />
  );
}

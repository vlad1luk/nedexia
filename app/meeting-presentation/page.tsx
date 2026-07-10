import type { Metadata } from "next";
import Deck from "./deck";

export const metadata: Metadata = {
  title: "Nedexia — Présentation du projet",
  description: "Présentation du projet Nedexia : Eden, le Score et le réseau.",
  robots: { index: false, follow: false },
};

export default function MeetingPresentationPage() {
  return <Deck />;
}

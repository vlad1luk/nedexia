"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import symbole from "@/public/symbole-eden.png";
import type { Intention } from "./diagnostic";

/* ── Eden analyse les réponses ─────────────────────────────── */

const etapesCalcul = [
  "Analyse de vos quinze réponses…",
  "Pondération selon votre objectif…",
  "Rédaction de votre lecture…",
  "Préparation de votre plan d’action…",
];

export function CalculScreen() {
  const [etape, setEtape] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setEtape((e) => Math.min(e + 1, etapesCalcul.length - 1)),
      850,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src={symbole} alt="" className="h-16 w-auto" />
      </motion.div>
      <h1 className="mt-8 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
        Eden lit votre diagnostic
      </h1>
      <div className="mt-4 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={etape}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-foreground/60"
          >
            {etapesCalcul[etape]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Résultat prêt, verrouillé derrière la création de compte ── */

const contenuVerrouille = [
  "Votre score de préparation sur 100",
  "La lecture d’Eden selon votre objectif",
  "Votre plan d’action initial, découpé en tâches",
  "La conversation avec Eden, déjà au fait de votre situation",
];

export function ResultatStep({
  intention,
  onAuth,
}: {
  intention: Intention;
  onAuth: (données: {
    prenom: string;
    courriel: string;
    fournisseur: "courriel" | "google";
  }) => void;
}) {
  const [prenom, setPrenom] = useState("");
  const [courriel, setCourriel] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState<"courriel" | "google" | null>(null);

  const soumettreCourriel = (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    if (!/^\S+@\S+\.\S+$/.test(courriel.trim())) {
      setErreur("Entrez une adresse courriel valide.");
      return;
    }
    setErreur(null);
    setEnvoi("courriel");
    // Petite latence pour matérialiser la création du compte.
    setTimeout(
      () =>
        onAuth({
          prenom: prenom.trim(),
          courriel: courriel.trim(),
          fournisseur: "courriel",
        }),
      700,
    );
  };

  const soumettreGoogle = () => {
    if (envoi) return;
    setEnvoi("google");
    setTimeout(
      () => onAuth({ prenom: "", courriel: "", fournisseur: "google" }),
      900,
    );
  };

  const champ =
    "mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy placeholder:text-foreground/30 outline-none transition-colors focus:border-teal";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Votre résultat est prêt.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/70">
          Eden a calculé votre score de préparation et rédigé une première
          lecture pour {intention.projectLabel}. Créez votre compte gratuit
          pour les débloquer — votre diagnostic sera conservé dans votre
          espace.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {/* Aperçu verrouillé */}
        <div className="relative overflow-hidden rounded-3xl border border-navy/10 bg-white p-8">
          <div className="relative mx-auto h-36 w-36 select-none" aria-hidden="true">
            {/* Jauge décorative : la vraie valeur reste côté calcul. */}
            <svg viewBox="0 0 160 160" className="h-full w-full blur-[6px]">
              <circle cx="80" cy="80" r="66" fill="none" strokeWidth="12" className="stroke-navy/10" />
              <circle
                cx="80"
                cy="80"
                r="66"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                stroke="#149696"
                strokeDasharray={2 * Math.PI * 66}
                strokeDashoffset={2 * Math.PI * 66 * 0.35}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-lg shadow-navy/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
            </span>
          </div>

          <p className="mt-6 text-center text-sm font-semibold uppercase tracking-wider text-foreground/50">
            Dans votre espace
          </p>
          <ul className="mt-4 space-y-3">
            {contenuVerrouille.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/70">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-teal">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Création de compte */}
        <div className="rounded-3xl border border-navy/10 bg-white p-8 shadow-xl shadow-navy/5">
          <h2 className="text-xl font-bold text-navy">Créer mon compte</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Courriel ou Google — moins d’une minute.
          </p>

          <form onSubmit={soumettreCourriel} className="mt-6">
            <label className="block">
              <span className="text-sm font-semibold text-navy">Prénom</span>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Votre prénom"
                className={champ}
              />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-navy">Courriel</span>
              <input
                type="email"
                value={courriel}
                onChange={(e) => setCourriel(e.target.value)}
                placeholder="vous@entreprise.ca"
                className={champ}
              />
            </label>
            {erreur && <p className="mt-2 text-sm font-medium text-coral">{erreur}</p>}
            <button
              type="submit"
              disabled={envoi !== null}
              className="mt-5 w-full rounded-full bg-navy px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-navy-deep disabled:translate-y-0 disabled:opacity-60"
            >
              {envoi === "courriel"
                ? "Création de votre espace…"
                : "Créer mon compte et débloquer"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-navy/10" />
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">ou</span>
            <span className="h-px flex-1 bg-navy/10" />
          </div>

          <button
            type="button"
            onClick={soumettreGoogle}
            disabled={envoi !== null}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-navy/15 bg-white px-8 py-3.5 text-base font-semibold text-navy transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy/5 disabled:translate-y-0 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3.01c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A11.99 11.99 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12.02 12.02 0 0 0 0 10.76l4-3.1Z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A11.99 11.99 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
            </svg>
            {envoi === "google" ? "Connexion à Google…" : "Continuer avec Google"}
          </button>

          <p className="mt-5 text-center text-xs leading-relaxed text-foreground/50">
            Gratuit et sans engagement. Vos réponses restent confidentielles
            et sont liées à votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}

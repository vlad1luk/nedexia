"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import symbole from "@/public/symbole-eden.png";
import { dimensions, intentions } from "./diagnostic";
import type { Entreprise, IntentionId } from "./diagnostic";

const boutonPrimaire =
  "rounded-full bg-navy px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-navy-deep";

/* ── Accueil du tunnel ─────────────────────────────────────── */

export function IntroStep({
  hasDraft,
  answeredCount,
  onStart,
  onResume,
  onRestart,
}: {
  hasDraft: boolean;
  answeredCount: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <Image src={symbole} alt="" priority className="h-12 w-auto animate-float-subtle" />
        <h1 className="mt-7 text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl">
          Faites le point sur votre entreprise, en sept minutes.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-foreground/70">
          Choisissez votre objectif, répondez à quinze questions concrètes.
          Eden calcule votre score de préparation et prépare votre premier
          plan d’action — sans compte, sans document à fournir.
        </p>
        <p className="mt-4 text-sm text-foreground/50">
          5 à 7 minutes · Aucun document requis · Vos réponses sont
          conservées si vous devez interrompre
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          {hasDraft ? (
            <>
              <button type="button" onClick={onResume} className={boutonPrimaire}>
                Reprendre mon diagnostic
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="text-base font-semibold text-navy transition-colors hover:text-teal"
              >
                Recommencer à zéro
              </button>
            </>
          ) : (
            <button type="button" onClick={onStart} className={boutonPrimaire}>
              Commencer le diagnostic
            </button>
          )}
        </div>
        {hasDraft && answeredCount > 0 && (
          <p className="mt-3 text-sm text-foreground/50">
            {answeredCount} réponse{answeredCount > 1 ? "s" : ""} sur 15 déjà
            enregistrée{answeredCount > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-navy/10 bg-white p-8 shadow-xl shadow-navy/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
          Ce qu’Eden passe en revue
        </p>
        <ul className="mt-5 space-y-4">
          {dimensions.map((dimension, i) => (
            <li key={dimension.id} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/5 text-sm font-bold text-navy">
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold text-navy">{dimension.label}</span>
                <span className="mt-0.5 block text-sm text-foreground/60">
                  {dimension.question}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-navy/5 pt-5 text-sm leading-relaxed text-foreground/60">
          À la fin, Eden calcule un score sur 100 et le lit selon votre
          objectif : céder, acquérir, vendre plus, financer ou structurer.
        </p>
      </div>
    </div>
  );
}

/* ── Choix de l’intention ──────────────────────────────────── */

export function IntentionStep({
  intention,
  onSelect,
}: {
  intention: IntentionId | null;
  onSelect: (id: IntentionId) => void;
}) {
  const [choisie, setChoisie] = useState<IntentionId | null>(intention);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const choisir = (id: IntentionId) => {
    if (timer.current) return;
    setChoisie(id);
    timer.current = setTimeout(() => onSelect(id), 280);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        Qu’est-ce qui vous amène?
      </h1>
      <p className="mt-3 text-lg text-foreground/70">
        Eden lira vos réponses à travers cet objectif — le score et le plan
        d’action en dépendent.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {intentions.map((item) => {
          const active = choisie === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => choisir(item.id)}
              className={`rounded-3xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/5 ${
                active
                  ? "border-leaf bg-white shadow-lg shadow-leaf/10"
                  : "border-navy/10 bg-white"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-lg font-bold text-navy">{item.label}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    active ? "border-leaf bg-leaf text-white" : "border-navy/20"
                  }`}
                >
                  {active && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-foreground/60">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Fiche entreprise (optionnelle) ────────────────────────── */

export function EntrepriseStep({
  entreprise,
  onSubmit,
  onBack,
}: {
  entreprise: Entreprise;
  onSubmit: (entreprise: Entreprise) => void;
  onBack: () => void;
}) {
  const [nom, setNom] = useState(entreprise.nom);
  const [neq, setNeq] = useState(entreprise.neq);
  const [site, setSite] = useState(entreprise.site);

  const champ =
    "mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy placeholder:text-foreground/30 outline-none transition-colors focus:border-teal";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        Votre entreprise
      </h1>
      <p className="mt-3 text-lg text-foreground/70">
        Ces informations aident Eden à préparer votre dossier. Elles sont
        optionnelles — vous pourrez les compléter plus tard.
      </p>

      <form
        className="mt-10 rounded-3xl border border-navy/10 bg-white p-8"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ nom: nom.trim(), neq: neq.trim(), site: site.trim() });
        }}
      >
        <label className="block">
          <span className="text-sm font-semibold text-navy">Nom de l’entreprise</span>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex. : Usinage Bellechasse inc."
            className={champ}
          />
        </label>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-navy">
            NEQ <span className="font-normal text-foreground/50">— numéro d’entreprise du Québec</span>
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={neq}
            onChange={(e) => setNeq(e.target.value)}
            placeholder="10 chiffres, tel qu’inscrit au Registraire (REQ)"
            className={champ}
          />
        </label>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-navy">Site web</span>
          <input
            type="text"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="votreentreprise.ca"
            className={champ}
          />
        </label>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button type="submit" className={boutonPrimaire}>
            Continuer
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit({ nom: nom.trim(), neq: neq.trim(), site: site.trim() })
            }
            className="text-base font-semibold text-navy transition-colors hover:text-teal"
          >
            Passer cette étape
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground/50 transition-colors hover:text-navy"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Changer d’objectif
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";
import { animate, motion } from "motion/react";
import { useEffect, useState } from "react";
import symbole from "@/public/symbole-eden.png";
import { getDimension, getIntention } from "./diagnostic";
import type { NiveauId } from "./diagnostic";
import type { DiagnosticRecord, Session } from "./storage";

const couleursNiveau: Record<
  NiveauId,
  { debut: string; fin: string; badge: string }
> = {
  fragile: { debut: "#f26522", fin: "#f06799", badge: "bg-coral/10 text-coral" },
  chantier: { debut: "#ffc20e", fin: "#f26522", badge: "bg-sun/15 text-navy" },
  solide: { debut: "#99ca3c", fin: "#149696", badge: "bg-leaf/15 text-leaf-deep" },
};

function ScoreGauge({ score, niveau }: { score: number; niveau: NiveauId }) {
  const [affiche, setAffiche] = useState(0);
  const rayon = 66;
  const circonference = 2 * Math.PI * rayon;
  const couleurs = couleursNiveau[niveau];

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setAffiche(Math.round(v)),
    });
    return () => controls.stop();
  }, [score]);

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <defs>
          <linearGradient id="jauge-score" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={couleurs.debut} />
            <stop offset="100%" stopColor={couleurs.fin} />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={rayon} fill="none" strokeWidth="12" className="stroke-navy/10" />
        <motion.circle
          cx="80"
          cy="80"
          r={rayon}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke="url(#jauge-score)"
          strokeDasharray={circonference}
          initial={{ strokeDashoffset: circonference }}
          animate={{ strokeDashoffset: circonference * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-navy">{affiche}</span>
        <span className="text-sm text-foreground/50">sur 100</span>
      </div>
    </div>
  );
}

export function Dashboard({
  session,
  record,
  onSignOut,
}: {
  session: Session;
  record: DiagnosticRecord;
  onSignOut: () => void;
}) {
  const intention = getIntention(record.intention);
  const result = record.result;

  const triees = [...result.dimensions].sort((a, b) => b.score - a.score);
  const forte = getDimension(triees[0].id);
  const faible = getDimension(triees[triees.length - 1].id);

  const dateDiagnostic = new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(record.creeLe));

  const salutation = session.prenom ? `Bonjour ${session.prenom}.` : "Bonjour.";

  return (
    <div className="mx-auto max-w-6xl">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Votre espace Nedexia
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {salutation} Voici où en est votre entreprise.
          </h1>
          <p className="mt-2 text-foreground/60">
            {record.entreprise.nom || "Votre entreprise"} · Diagnostic complété
            le {dateDiagnostic}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="text-sm font-semibold text-foreground/50 transition-colors hover:text-navy"
        >
          Se déconnecter
        </button>
      </div>

      {/* Score + lecture */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-navy/10 bg-white p-8 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Score de préparation
          </p>
          <div className="mt-6">
            <ScoreGauge score={result.score} niveau={result.niveau} />
          </div>
          <span
            className={`mt-6 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${couleursNiveau[result.niveau].badge}`}
          >
            {result.niveauLabel}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="rounded-3xl border border-navy/10 bg-white p-8 lg:col-span-2"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            La lecture d’Eden — {intention.label}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            {result.lecture}
          </p>
          <div className="mt-6 grid gap-4 border-t border-navy/5 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-leaf-deep">Votre meilleur appui</p>
              <p className="mt-1 font-semibold text-navy">{forte.label}</p>
              <p className="mt-0.5 text-sm text-foreground/60">{forte.question}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-coral">Chantier prioritaire</p>
              <p className="mt-1 font-semibold text-navy">{faible.label}</p>
              <p className="mt-0.5 text-sm text-foreground/60">{faible.question}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dimensions + plan d’action */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="rounded-3xl border border-navy/10 bg-white p-8"
        >
          <h2 className="text-lg font-bold text-navy">Les cinq dimensions</h2>
          <div className="mt-6 space-y-5">
            {result.dimensions.map((dim, i) => {
              const meta = getDimension(dim.id);
              return (
                <div key={dim.id}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-navy">{meta.label}</span>
                    <span className="text-sm text-foreground/50">{dim.score} / 100</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-leaf to-teal"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="rounded-3xl border border-navy/10 bg-white p-8"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-bold text-navy">Plan d’action initial</h2>
            <span className="text-xs text-foreground/50">15 à 30 min par tâche</span>
          </div>
          <ul className="mt-6 space-y-3">
            {result.planAction.map((tache, i) => (
              <li
                key={tache.label}
                className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                  i === 0 ? "border-leaf/60 bg-white shadow-sm" : "border-navy/5 bg-background/60"
                }`}
              >
                <span
                  className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${
                    i === 0 ? "border-leaf" : "border-navy/20"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-navy">{tache.label}</span>
                  <span className="mt-0.5 block text-xs text-foreground/50">
                    {tache.duree}{i === 0 ? " · à faire en premier" : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Conversation Eden + dossier */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
          className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-7 lg:col-span-3"
        >
          <div className="flex items-center gap-2 border-b border-navy/5 pb-4">
            <Image src={symbole} alt="" className="h-4 w-auto" />
            <span className="text-sm font-semibold text-navy">Eden</span>
            <span className="ml-auto text-xs text-foreground/40">
              Au fait de votre diagnostic
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white p-1.5">
                <Image src={symbole} alt="Eden" className="h-auto w-full" />
              </span>
              <div className="max-w-[85%] space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-navy/5 px-4 py-3 text-sm leading-relaxed text-foreground/80">
                  {salutation} J’ai analysé vos réponses : votre score de
                  préparation est de {result.score} sur 100. Pour{" "}
                  {intention.projectLabel}, votre meilleur appui est votre
                  dimension {forte.label.toLowerCase()} — le chantier
                  prioritaire, la dimension {faible.label.toLowerCase()}.
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-navy/5 px-4 py-3 text-sm leading-relaxed text-foreground/80">
                  J’ai préparé vos quatre premières tâches, de 15 à 30 minutes
                  chacune. On commence par «&nbsp;{result.planAction[0].label}&nbsp;»?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-navy/10 px-4 py-2.5">
              <span className="flex-1 text-sm text-foreground/40">Répondre à Eden…</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          className="rounded-3xl border border-navy/10 bg-background/60 p-6 sm:p-7 lg:col-span-2"
        >
          <h2 className="text-lg font-bold text-navy">Votre dossier</h2>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Entreprise", record.entreprise.nom || "À compléter"],
              ["NEQ", record.entreprise.neq || "À compléter"],
              ["Site web", record.entreprise.site || "À compléter"],
              ["Objectif", intention.label],
              ["Diagnostic initial", dateDiagnostic],
            ].map(([label, valeur]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b border-navy/5 pb-3">
                <dt className="shrink-0 text-foreground/50">{label}</dt>
                <dd className="text-right font-medium text-navy">{valeur}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-foreground/50">
            Votre dossier s’enrichit à mesure que vous complétez les tâches de
            votre plan — il devient la base de vos échanges avec votre CPA,
            votre banquier ou un repreneur.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import symbole from "@/public/symbole-eden.png";
import { computeResult, getIntention, questions } from "./diagnostic";
import type { Entreprise, IntentionId } from "./diagnostic";
import {
  clearDraft,
  clearSession,
  latestRecord,
  loadDraft,
  loadSession,
  saveDraft,
  saveRecord,
  saveSession,
} from "./storage";
import type {
  DiagnosticDraft,
  DiagnosticRecord,
  FunnelStep,
  Session,
} from "./storage";
import { Dashboard } from "./dashboard";
import { QuestionsStep } from "./funnel-questions";
import { CalculScreen, ResultatStep } from "./funnel-resultat";
import { EntrepriseStep, IntentionStep, IntroStep } from "./funnel-steps";

type Phase = "chargement" | "intro" | FunnelStep | "calcul" | "espace";

type Boot = {
  session: Session | null;
  record: DiagnosticRecord | null;
  draft: DiagnosticDraft | null;
};

const entrepriseVide: Entreprise = { nom: "", neq: "", site: "" };

const souscriptionVide = () => () => {};

export default function EspaceFlow() {
  const [phase, setPhase] = useState<Phase>("chargement");
  const [intention, setIntention] = useState<IntentionId | null>(null);
  const [entreprise, setEntreprise] = useState<Entreprise>(entrepriseVide);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draftStep, setDraftStep] = useState<FunnelStep | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);

  // Restauration : le serveur rend l’écran de chargement (instantané null);
  // au premier rendu client, le stockage est lu une seule fois, puis l’état
  // est ajusté pendant le rendu.
  const bootRef = useRef<Boot | null>(null);
  const boot = useSyncExternalStore(
    souscriptionVide,
    () => {
      if (!bootRef.current) {
        bootRef.current = {
          session: loadSession(),
          record: latestRecord(),
          draft: loadDraft(),
        };
      }
      return bootRef.current;
    },
    () => null,
  );

  if (boot && phase === "chargement") {
    if (boot.session && boot.record) {
      setSession(boot.session);
      setRecord(boot.record);
      setPhase("espace");
    } else {
      if (boot.draft) {
        setIntention(boot.draft.intention);
        setEntreprise(boot.draft.entreprise);
        setAnswers(boot.draft.answers);
        setQuestionIndex(Math.min(boot.draft.questionIndex, questions.length - 1));
        setDraftStep(boot.draft.step);
      }
      setPhase("intro");
    }
  }

  // Sauvegarde du brouillon à chaque progression dans le tunnel.
  useEffect(() => {
    if (phase === "chargement" || phase === "intro" || phase === "espace") return;
    saveDraft({
      version: 1,
      step: phase === "calcul" ? "resultat" : phase,
      intention,
      entreprise,
      answers,
      questionIndex,
      updatedAt: new Date().toISOString(),
    });
  }, [phase, intention, entreprise, answers, questionIndex]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [phase]);

  // Temps de « lecture » d’Eden avant l’écran de résultat.
  useEffect(() => {
    if (phase !== "calcul") return;
    const timer = setTimeout(() => setPhase("resultat"), 3400);
    return () => clearTimeout(timer);
  }, [phase]);

  const demarrer = useCallback(() => {
    clearDraft();
    setIntention(null);
    setEntreprise(entrepriseVide);
    setAnswers({});
    setQuestionIndex(0);
    setDraftStep(null);
    setPhase("intention");
  }, []);

  const reprendre = useCallback(() => {
    setPhase(draftStep ?? "intention");
  }, [draftStep]);

  const repondre = useCallback(
    (questionId: string, choixIndex: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: choixIndex }));
      if (questionIndex >= questions.length - 1) {
        setPhase("calcul");
      } else {
        setQuestionIndex(questionIndex + 1);
      }
    },
    [questionIndex],
  );

  const authentifier = useCallback(
    (données: { prenom: string; courriel: string; fournisseur: "courriel" | "google" }) => {
      if (!intention) return;
      const nouvelleSession: Session = {
        prenom: données.prenom,
        courriel: données.courriel,
        fournisseur: données.fournisseur,
        creeLe: new Date().toISOString(),
      };
      const nouveauRecord: DiagnosticRecord = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `diagnostic-${Date.now()}`,
        creeLe: new Date().toISOString(),
        intention,
        entreprise,
        answers,
        result: computeResult(intention, answers),
      };
      saveSession(nouvelleSession);
      saveRecord(nouveauRecord);
      clearDraft();
      setSession(nouvelleSession);
      setRecord(nouveauRecord);
      setPhase("espace");
    },
    [intention, entreprise, answers],
  );

  const seDeconnecter = useCallback(() => {
    clearSession();
    setSession(null);
    setRecord(null);
    setIntention(null);
    setEntreprise(entrepriseVide);
    setAnswers({});
    setQuestionIndex(0);
    setDraftStep(null);
    setPhase("intro");
  }, []);

  const progression = (() => {
    switch (phase) {
      case "intention":
        return { pct: 8, label: "Étape 1 sur 3 — Votre objectif" };
      case "entreprise":
        return { pct: 16, label: "Étape 2 sur 3 — Votre entreprise" };
      case "questions":
        return {
          pct: 16 + (questionIndex / questions.length) * 78,
          label: "Étape 3 sur 3 — Diagnostic",
        };
      case "calcul":
        return { pct: 96, label: "Analyse en cours" };
      case "resultat":
        return { pct: 100, label: "Résultat prêt" };
      default:
        return null;
    }
  })();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-[70vh] max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        {progression && (
          <div className="mx-auto mb-12 max-w-2xl">
            <div className="flex items-baseline justify-between text-xs font-medium text-foreground/50">
              <span>Diagnostic Eden</span>
              <span>{progression.label}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy/10">
              <motion.div
                animate={{ width: `${progression.pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-leaf to-teal"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={phase === "questions" ? "questions" : phase}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {phase === "chargement" && (
              <div className="flex min-h-[50vh] items-center justify-center">
                <Image src={symbole} alt="" className="h-12 w-auto animate-float-subtle" />
              </div>
            )}

            {phase === "intro" && (
              <IntroStep
                hasDraft={draftStep !== null}
                answeredCount={Object.keys(answers).length}
                onStart={demarrer}
                onResume={reprendre}
                onRestart={demarrer}
              />
            )}

            {phase === "intention" && (
              <IntentionStep
                intention={intention}
                onSelect={(id) => {
                  setIntention(id);
                  setPhase("entreprise");
                }}
              />
            )}

            {phase === "entreprise" && (
              <EntrepriseStep
                entreprise={entreprise}
                onSubmit={(valeurs) => {
                  setEntreprise(valeurs);
                  setPhase("questions");
                }}
                onBack={() => setPhase("intention")}
              />
            )}

            {phase === "questions" && (
              <QuestionsStep
                index={questionIndex}
                answers={answers}
                onAnswer={repondre}
                onBack={() =>
                  questionIndex === 0
                    ? setPhase("entreprise")
                    : setQuestionIndex(questionIndex - 1)
                }
              />
            )}

            {phase === "calcul" && <CalculScreen />}

            {phase === "resultat" && intention && (
              <ResultatStep intention={getIntention(intention)} onAuth={authentifier} />
            )}

            {phase === "espace" && session && record && (
              <Dashboard session={session} record={record} onSignOut={seDeconnecter} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

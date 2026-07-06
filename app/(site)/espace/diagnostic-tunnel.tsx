"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Screen0Intro } from "./screen0-intro";
import { Screen1Intention } from "./screen1-intention";
import { Screen2Req } from "./screen2-req";
import { Screen3Site } from "./screen3-site";
import { Screen4Questions } from "./screen4-questions";
import { Screen5Intention } from "./screen5-intention";
import { Screen6Result } from "./screen6-result";
import { calculateScore } from "@/lib/espace/score";
import type {
  DiagnosticSubmission,
  Intention,
  IntentionPrecision,
  ReqFallback,
  Scale,
  SiteFallback,
} from "@/lib/espace/types";

/** Doit rester identique à la clé lue par /espace/bienvenue (finaliseur). */
const STORAGE_KEY = "nedexia.diagnostic.v1";

function newSessionId() {
  return `nx-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function loadDraft(): DiagnosticSubmission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosticSubmission;
  } catch {
    return null;
  }
}

function saveDraft(draft: DiagnosticSubmission) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage indisponible — on continue sans cache
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/** Fire-and-forget — ne bloque jamais le parcours, échecs ignorés */
function trackStep(sessionId: string, screen: number) {
  if (typeof window === "undefined") return;
  try {
    const blob = new Blob([JSON.stringify({ sessionId, screen })], {
      type: "application/json",
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/diagnostic/track", blob);
    } else {
      void fetch("/api/diagnostic/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, screen }),
        keepalive: true,
      });
    }
  } catch {
    // Tracking ne doit jamais bloquer
  }
}

export function DiagnosticTunnel() {
  const [screen, setScreen] = useState<number>(0);
  // L'état initial est un placeholder neutre — on l'hydrate côté client uniquement
  // (sessionId/startedAt dépendent du browser, donc générés à l'hydratation).
  const [data, setData] = useState<DiagnosticSubmission>(() => ({
    sessionId: "",
    startedAt: "",
    reachedScreen: 0,
  }));
  const [hydrated, setHydrated] = useState(false);

  // Hydratation client-only : lire le brouillon ou ouvrir une session.
  // setState dans cet effect est volontaire (hydratation depuis localStorage,
  // qui n'existe pas en SSR). Pas de cascade de re-renders au-delà du tick
  // initial.
  /* eslint-disable react-hooks/set-state-in-effect -- hydratation client-only depuis localStorage */
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !draft.completedAt && draft.sessionId) {
      setData(draft);
      // Si le draft a une intention, on peut aller jusqu'à l'écran 5 ;
      // sinon, on plafonne à l'écran 1 pour collecter l'intention d'abord.
      const cap = draft.intention ? 5 : 1;
      setScreen(Math.min(draft.reachedScreen ?? 0, cap));
    } else {
      setData({
        sessionId: newSessionId(),
        startedAt: new Date().toISOString(),
        reachedScreen: 0,
      });
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persistance + tracking à chaque transition d'écran. Pas de setState ici
  // (le bump de `reachedScreen` est fait dans `goTo` pour éviter la cascade).
  useEffect(() => {
    if (!hydrated || !data.sessionId) return;
    saveDraft(data);
    trackStep(data.sessionId, screen);
  }, [screen, hydrated, data]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  const goTo = useCallback(
    (s: number) =>
      setData((prev) => {
        setScreen(s);
        const reached = Math.max(prev.reachedScreen, s);
        return reached === prev.reachedScreen
          ? prev
          : { ...prev, reachedScreen: reached };
      }),
    []
  );

  const updateData = useCallback((patch: Partial<DiagnosticSubmission>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
  }, []);

  // Calcul du score à l'arrivée sur l'écran 6
  const score = useMemo(() => {
    if (screen < 6) return null;
    return calculateScore(data);
  }, [screen, data]);

  // À l'écran 6, on fige le diagnostic complet (avec score) dans localStorage.
  // C'est ce brouillon que `/espace/bienvenue` enverra à Supabase après auth.
  useEffect(() => {
    if (screen !== 6 || !score || !data.intention) return;
    const completed: DiagnosticSubmission = {
      ...data,
      score,
      completedAt: new Date().toISOString(),
      reachedScreen: 6,
    };
    saveDraft(completed);
  }, [screen, score, data]);

  if (!hydrated) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-sm text-foreground/55">
        Chargement…
      </div>
    );
  }

  switch (screen) {
    case 0:
      return (
        <Screen0Intro
          onStart={() => {
            clearDraft();
            const fresh: DiagnosticSubmission = {
              sessionId: newSessionId(),
              startedAt: new Date().toISOString(),
              reachedScreen: 1,
            };
            setData(fresh);
            saveDraft(fresh);
            goTo(1);
          }}
        />
      );

    case 1:
      return (
        <Screen1Intention
          initial={data.intention}
          initialPrecision={data.intentionPrecision}
          onBack={() => goTo(0)}
          onContinue={(intention: Intention, precision?: IntentionPrecision) => {
            updateData({ intention, intentionPrecision: precision });
            goTo(2);
          }}
        />
      );

    case 2:
      return (
        <Screen2Req
          initialUrl={data.reqUrl}
          initialFallback={data.reqFallback}
          onBack={() => goTo(1)}
          onContinue={(d: {
            reqUrl?: string;
            reqFallback?: ReqFallback;
            reqSkipped?: boolean;
          }) => {
            updateData({
              reqUrl: d.reqUrl,
              reqFallback: d.reqFallback,
              reqSkipped: d.reqSkipped,
            });
            goTo(3);
          }}
        />
      );

    case 3:
      return (
        <Screen3Site
          initialUrl={data.siteUrl}
          initialFallback={data.siteFallback}
          onBack={() => goTo(2)}
          onContinue={(d: {
            siteUrl?: string;
            siteFallback?: SiteFallback;
            siteSkipped?: boolean;
          }) => {
            updateData({
              siteUrl: d.siteUrl,
              siteFallback: d.siteFallback,
              siteSkipped: d.siteSkipped,
            });
            goTo(4);
          }}
        />
      );

    case 4:
      return (
        <Screen4Questions
          initial={{
            blocA: data.answersBlocA,
            blocB: data.answersBlocB,
            blocC: data.answersBlocC,
            fileName: data.uploadedFile?.name,
            fileSize: data.uploadedFile?.size,
          }}
          onBack={() => goTo(3)}
          onContinue={(d: {
            blocA: Record<string, Scale>;
            blocB: Record<string, Scale>;
            blocC: Record<string, Scale>;
            file?: { name: string; size: number };
          }) => {
            updateData({
              answersBlocA: d.blocA,
              answersBlocB: d.blocB,
              answersBlocC: d.blocC,
              uploadedFile: d.file,
            });
            goTo(5);
          }}
        />
      );

    case 5:
      return (
        <Screen5Intention
          intention={data.intention!}
          initial={data.answersIntention}
          onBack={() => goTo(4)}
          onContinue={(answers: Record<string, Scale>) => {
            updateData({ answersIntention: answers });
            goTo(6);
          }}
        />
      );

    case 6:
    default:
      if (!score || !data.intention) return null;
      return <Screen6Result intention={data.intention} score={score} />;
  }
}

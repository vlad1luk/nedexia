import type {
  DiagnosticResult,
  Entreprise,
  IntentionId,
} from "./diagnostic";

// Persistance côté client uniquement. Le brouillon permet de reprendre le
// diagnostic sans compte; la « session » et les diagnostics enregistrés
// simulent la couche compte + base de données en attendant le vrai backend
// (auth courriel/Google et persistance serveur) — même contrat, à rebrancher.

const DRAFT_KEY = "nedexia.eden.diagnostic.draft.v1";
const SESSION_KEY = "nedexia.session.v1";
const RECORDS_KEY = "nedexia.eden.diagnostics.v1";

export type FunnelStep = "intention" | "entreprise" | "questions" | "resultat";

export type DiagnosticDraft = {
  version: 1;
  step: FunnelStep;
  intention: IntentionId | null;
  entreprise: Entreprise;
  answers: Record<string, number>;
  questionIndex: number;
  updatedAt: string;
};

export type Session = {
  prenom: string;
  courriel: string;
  fournisseur: "courriel" | "google";
  creeLe: string;
};

export type DiagnosticRecord = {
  id: string;
  creeLe: string;
  intention: IntentionId;
  entreprise: Entreprise;
  answers: Record<string, number>;
  result: DiagnosticResult;
};

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage plein ou bloqué : le tunnel continue sans reprise.
  }
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadDraft(): DiagnosticDraft | null {
  const draft = read<DiagnosticDraft>(DRAFT_KEY);
  return draft && draft.version === 1 ? draft : null;
}

export function saveDraft(draft: DiagnosticDraft) {
  write(DRAFT_KEY, draft);
}

export function clearDraft() {
  remove(DRAFT_KEY);
}

export function loadSession(): Session | null {
  return read<Session>(SESSION_KEY);
}

export function saveSession(session: Session) {
  write(SESSION_KEY, session);
}

export function clearSession() {
  remove(SESSION_KEY);
}

export function loadRecords(): DiagnosticRecord[] {
  return read<DiagnosticRecord[]>(RECORDS_KEY) ?? [];
}

export function saveRecord(record: DiagnosticRecord) {
  write(RECORDS_KEY, [record, ...loadRecords()]);
}

export function latestRecord(): DiagnosticRecord | null {
  return loadRecords()[0] ?? null;
}

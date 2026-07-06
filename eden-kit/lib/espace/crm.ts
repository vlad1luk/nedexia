/**
 * CRM entreprise Nedexia — contacts et opportunités.
 * Types, libellés FR et mapping ligne Supabase ↔ objet, partagés serveur/client.
 */

export type ContactType =
  | "client"
  | "prospect"
  | "partenaire"
  | "conseiller"
  | "repreneur"
  | "investisseur"
  | "fournisseur"
  | "autre";

export type CrmSource = "eden" | "user" | "system";

export type CrmPriority = "high" | "normal" | "low";

export type Contact = {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  contactType: ContactType;
  email: string | null;
  phone: string | null;
  notes: string | null;
  priority: CrmPriority;
  nextAction: string | null;
  nextActionDate: string | null;
  lastContactedAt: string | null;
  source: CrmSource;
  createdAt: string;
  updatedAt: string;
};

export type OpportunityType =
  | "commerce"
  | "alliance"
  | "cession"
  | "acquisition"
  | "financement"
  | "autre";

export type OpportunityStage =
  | "qualification"
  | "discussion"
  | "proposition"
  | "negociation"
  | "gagne"
  | "perdu";

export type Opportunity = {
  id: string;
  title: string;
  oppType: OpportunityType;
  stage: OpportunityStage;
  value: number | null;
  contactId: string | null;
  projectId: string | null;
  notes: string | null;
  priority: CrmPriority;
  nextAction: string | null;
  expectedCloseDate: string | null;
  probability: number | null;
  source: CrmSource;
  createdAt: string;
  updatedAt: string;
};

// ─────────────── Libellés ───────────────

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  client: "Client",
  prospect: "Prospect",
  partenaire: "Partenaire",
  conseiller: "Conseiller",
  repreneur: "Repreneur",
  investisseur: "Investisseur",
  fournisseur: "Fournisseur",
  autre: "Autre",
};

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  commerce: "Commerce",
  alliance: "Alliance",
  cession: "Cession",
  acquisition: "Acquisition",
  financement: "Financement",
  autre: "Autre",
};

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  qualification: "Qualification",
  discussion: "Discussion",
  proposition: "Proposition",
  negociation: "Négociation",
  gagne: "Gagné",
  perdu: "Perdu",
};

/** Ordre du pipeline (étapes ouvertes puis issues). */
export const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = [
  "qualification",
  "discussion",
  "proposition",
  "negociation",
  "gagne",
  "perdu",
];

/** Étapes ouvertes affichées en kanban. */
export const OPEN_OPPORTUNITY_STAGES: OpportunityStage[] = [
  "qualification",
  "discussion",
  "proposition",
  "negociation",
];

export const CRM_PRIORITY_LABELS: Record<CrmPriority, string> = {
  high: "Haute",
  normal: "Normale",
  low: "Basse",
};

/** Probabilité par défaut selon l'étape du pipeline. */
export function defaultProbability(stage: OpportunityStage): number {
  switch (stage) {
    case "qualification":
      return 20;
    case "discussion":
      return 40;
    case "proposition":
      return 60;
    case "negociation":
      return 80;
    case "gagne":
      return 100;
    case "perdu":
      return 0;
  }
}

export function effectiveProbability(opp: Opportunity): number {
  return opp.probability ?? defaultProbability(opp.stage);
}

export function weightedValue(opp: Opportunity): number {
  if (opp.value == null) return 0;
  return (opp.value * effectiveProbability(opp)) / 100;
}

export function isOpenStage(stage: OpportunityStage): boolean {
  return stage !== "gagne" && stage !== "perdu";
}

// ─────────────── Mapping Supabase ───────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToContact(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? null,
    organization: row.organization ?? null,
    contactType: (row.contact_type as ContactType) ?? "autre",
    email: row.email ?? null,
    phone: row.phone ?? null,
    notes: row.notes ?? null,
    priority: (row.priority as CrmPriority) ?? "normal",
    nextAction: row.next_action ?? null,
    nextActionDate: row.next_action_date ?? null,
    lastContactedAt: row.last_contacted_at ?? null,
    source: (row.source as CrmSource) ?? "user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToOpportunity(row: any): Opportunity {
  return {
    id: row.id,
    title: row.title,
    oppType: (row.opp_type as OpportunityType) ?? "autre",
    stage: (row.stage as OpportunityStage) ?? "qualification",
    value: row.value != null ? Number(row.value) : null,
    contactId: row.contact_id ?? null,
    projectId: row.project_id ?? null,
    notes: row.notes ?? null,
    priority: (row.priority as CrmPriority) ?? "normal",
    nextAction: row.next_action ?? null,
    expectedCloseDate: row.expected_close_date ?? null,
    probability: row.probability != null ? Number(row.probability) : null,
    source: (row.source as CrmSource) ?? "user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Formate une valeur monétaire en dollars canadiens. */
export function formatValue(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "short",
    year: iso.slice(0, 4) !== new Date().getFullYear().toString() ? "numeric" : undefined,
  }).format(new Date(iso.includes("T") ? iso : `${iso}T12:00:00`));
}

export function isActionOverdue(date: string | null): boolean {
  if (!date) return false;
  const d = new Date(date.includes("T") ? date : `${date}T23:59:59`);
  return d.getTime() < Date.now();
}

export function nextStage(stage: OpportunityStage): OpportunityStage | null {
  const idx = OPPORTUNITY_STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx >= OPPORTUNITY_STAGE_ORDER.length - 1) return null;
  return OPPORTUNITY_STAGE_ORDER[idx + 1]!;
}

export function prevStage(stage: OpportunityStage): OpportunityStage | null {
  const idx = OPPORTUNITY_STAGE_ORDER.indexOf(stage);
  if (idx <= 0) return null;
  return OPPORTUNITY_STAGE_ORDER[idx - 1]!;
}

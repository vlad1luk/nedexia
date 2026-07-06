/**
 * Construit le bloc de contexte du dossier d'entreprise injecté dans le
 * system prompt d'Eden. Plus le dossier est riche, plus Eden est précis.
 */

import {
  ACCOMP_PHASES,
  getCurrentPhaseIndex,
  getNextAction,
  getWeakestDimension,
  type DossierDocSignal,
} from "@/lib/espace/dossier";
import {
  evaluateDestination,
  type CriterionStatus,
  type Destination,
} from "@/lib/espace/destination";
import { compactProgression, type ScoreHistoryPoint } from "@/lib/espace/score-history";
import {
  nextOpenMilestone,
  type MilestoneStatus,
  type ProgramMilestone,
} from "@/lib/espace/program";
import type { EdenNote } from "@/lib/eden/notes-store";
import { INTENTION_LECTURE, TIER_MESSAGES } from "@/lib/espace/score";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  daysUntil,
  dueLabel,
  edenTasksThisWeekCount,
  isOpen,
  type Task,
} from "@/lib/espace/tasks";
import {
  DIMENSION_LABELS,
  DIMENSION_WEIGHTS,
  INTENTION_LABELS,
  TIER_LABELS,
  type DiagnosticSubmission,
  type DimensionId,
  type Intention,
  type Tier,
} from "@/lib/espace/types";

/** Ce qu'Eden DOIT faire ensuite selon le palier (réf. Document 2, partie 4). */
const TIER_PLAYBOOK: Record<Tier, string> = {
  rouge:
    "Identifie les 2 dimensions les plus faibles et oriente vers deux ou trois actions concrètes, amenées en prose plutôt qu'en liste exhaustive. NE PROPOSE PAS le matching à ce stade.",
  orange:
    "Identifie 2-3 dimensions à travailler, propose un plan 30-60 jours, et annonce que le matching s'ouvrira quand certains seuils seront atteints.",
  jaune:
    "Identifie 1-2 optimisations prioritaires, propose un accès partiel au réseau, annonce que le matching B2B s'ouvre bientôt.",
  vert: "Oriente directement vers le pilier de l'intention, propose l'accès au matching et suggère le Score vérifié.",
};

/** Ordre des questions clés par intention (réf. Document 2, partie 3). */
const INTENTION_PLAYBOOK: Record<Intention, string> = {
  commerce:
    "Cible des entreprises claire → offre en une phrase → ventes actuelles et part du plus gros client → capacité à doubler le volume. Alertes : offre floue, dépendance client > 30 %, capacité limitée.",
  alliance:
    "Ce qu'il cherche chez un partenaire → collaborations passées → l'entreprise tourne-t-elle sans lui → documents clés mobilisables. Alertes : mauvaise expérience passée, dépendance au fondateur, documentation absente.",
  cession:
    "Horizon de cession → idée de la valeur → l'entreprise fonctionne sans lui → plan de relève → 3 derniers bilans à jour. Le Score SPC s'active. Alertes : horizon immédiat + faible préparation, dépendance fondateur, pas de valorisation.",
  acquisition:
    "Capacité de financement → type de cible (secteur, taille, géo) → acquisitions passées → motivation. Alertes : pas de financement identifié (orienter BDC/Desjardins), critères flous.",
  structuration:
    "Aspect le plus préoccupant (finances/organisation/croissance/relève) → problème principal nommé → ce qui l'a empêché de le régler. Oriente vers la lecture du Score puis les dimensions faibles.",
  exploration:
    "Commence par l'humain et le sommet, puis fais émerger l'intention réelle avant de proposer une direction.",
};

import { EDEN_SYSTEM_PROMPT } from "./system-prompt";

export type EdenProfile = {
  displayName: string;
  companyName: string | null;
  email: string | null;
  sector?: string | null;
  goal?: string | null;
};

/** Métadonnées sur la relation Eden ↔ dirigeant (continuité entre conversations). */
export type EdenRelationMeta = {
  /** Nombre total de conversations (incluant celle-ci). */
  conversationCount: number;
  /** Date du dernier message avant celui-ci, ou null si premier échange. */
  lastExchangeAt: string | null;
};

/** Résumé court d'une conversation passée. */
export type PastConversationSummary = {
  title: string;
  summary: string;
  updatedAt: string | null;
};

function describeCollecte(submission: DiagnosticSubmission): string[] {
  const lines: string[] = [];

  if (submission.reqUrl) {
    lines.push(`- Fiche REQ : lien fourni (${submission.reqUrl})`);
  } else if (submission.reqFallback) {
    lines.push(
      `- Structure juridique (déclaré) : ${submission.reqFallback.formeJuridique}, créée en ${submission.reqFallback.anneeCreation}, ${submission.reqFallback.nbDirigeants} dirigeant(s)`
    );
  } else {
    lines.push("- Fiche REQ : NON fournie (structure juridique à compléter)");
  }

  if (submission.siteUrl) {
    lines.push(`- Site web : lien fourni (${submission.siteUrl})`);
  } else if (submission.siteFallback) {
    lines.push(
      `- Offre (déclaré) : « ${submission.siteFallback.offre} » pour « ${submission.siteFallback.publicCible} »`
    );
  } else {
    lines.push("- Site web / offre : NON fourni (clarté de l'offre à préciser)");
  }

  lines.push(
    submission.uploadedFile
      ? `- Document téléversé : ${submission.uploadedFile.name} (pas encore analysé)`
      : "- États financiers : aucun document fourni"
  );

  return lines;
}

function describeDimensions(submission: DiagnosticSubmission): string[] {
  const dims = submission.score?.dimensions;
  return (Object.keys(DIMENSION_LABELS) as DimensionId[]).map((id) => {
    const value = dims?.[id] ?? null;
    const weight = DIMENSION_WEIGHTS[id];
    return value !== null
      ? `- ${DIMENSION_LABELS[id]} (poids ${weight}%) : ${value}/100`
      : `- ${DIMENSION_LABELS[id]} (poids ${weight}%) : non évaluée`;
  });
}

/** Bloc de contexte décrivant l'état du dossier. */
export function buildDossierContext(
  submission: DiagnosticSubmission | null,
  profile: EdenProfile
): string {
  const header = [
    "## CONTEXTE DU DOSSIER ENTREPRISE (privé, fourni par Nedexia)",
    `Interlocuteur : ${profile.displayName}${
      profile.companyName ? ` — ${profile.companyName}` : ""
    }`,
  ];
  if (profile.sector) header.push(`Secteur d'activité : ${profile.sector}`);
  if (profile.goal) header.push(`Objectif déclaré à l'inscription : ${profile.goal}`);

  if (!submission || !submission.score || !submission.intention) {
    return [
      ...header,
      "Aucun diagnostic complété pour l'instant. Invitez la personne à faire le diagnostic ou aidez-la à clarifier son besoin.",
    ].join("\n");
  }

  const score = submission.score;
  const intention = submission.intention;
  const weakest = getWeakestDimension(score);
  const nextAction = getNextAction(submission);

  const phaseIndex = getCurrentPhaseIndex(score.total);
  const phase = ACCOMP_PHASES[phaseIndex];
  const nextPhase = ACCOMP_PHASES[phaseIndex + 1] ?? null;

  return [
    ...header,
    "",
    `Parcours d'accompagnement : phase ${phaseIndex + 1}/${ACCOMP_PHASES.length} · « ${phase.title} » — ${phase.summary}`,
    nextPhase
      ? `Prochaine phase : « ${nextPhase.title} ». Guide le dirigeant étape par étape vers cette phase ; ne saute pas d'étapes.`
      : "Dernière phase du parcours : consolide et prépare la suite (matching, mise en relation).",
    `Objectif principal : ${INTENTION_LABELS[intention]} (${intention})`,
    `Lecture stratégique : ${INTENTION_LECTURE[intention]}`,
    `Trame de questions pour cette intention : ${INTENTION_PLAYBOOK[intention]}`,
    "",
    `Score global : ${score.total}/100 — palier « ${TIER_LABELS[score.tier]} » (${score.tier})`,
    `Lecture du palier : ${TIER_MESSAGES[score.tier]}`,
    `Ce que tu fais à ce palier : ${TIER_PLAYBOOK[score.tier]}`,
    "",
    "Détail par dimension :",
    ...describeDimensions(submission),
    "",
    weakest
      ? `Dimension la plus fragile : ${DIMENSION_LABELS[weakest]}.`
      : "Dimension la plus fragile : à déterminer.",
    `Prochaine action recommandée : ${nextAction}`,
    "",
    "Ce qu'Eden a déjà collecté :",
    ...describeCollecte(submission),
  ].join("\n");
}

/** Bloc de contexte décrivant le plan d'action (tâches actives). */
export function buildTasksContext(tasks: Task[]): string {
  const open = tasks.filter(isOpen);
  if (open.length === 0) {
    return [
      "## PLAN D'ACTION",
      "Aucune tâche active. Si l'échange débouche sur des actions concrètes, crée 1 à 3 tâches datées avec l'outil create_tasks.",
    ].join("\n");
  }

  const overdue = open
    .filter((t) => daysUntil(t.dueDate) < 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = open
    .filter((t) => daysUntil(t.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const fmt = (t: Task) =>
    `- [${t.id}] « ${t.title} » — ${TASK_STATUS_LABELS[t.status]}, ${TASK_PRIORITY_LABELS[t.priority]}, échéance ${dueLabel(t.dueDate)}`;

  const lines = ["## PLAN D'ACTION (tâches actives du dirigeant)"];
  if (overdue.length > 0) {
    lines.push("Tâches EN RETARD — avant de les redater, demande à la personne ce qui a coincé, puis adapte selon sa réponse :");
    lines.push(...overdue.map(fmt));
  }
  if (upcoming.length > 0) {
    lines.push("Tâches à venir :");
    lines.push(...upcoming.map(fmt));
  }
  lines.push(
    `Tâches Eden actives cette semaine : ${edenTasksThisWeekCount(tasks)}/3.`
  );
  return lines.join("\n");
}

export type DocContextItem = {
  id: string;
  name: string;
  analysisStatus: string;
  docType?: string | null;
  summary?: string | null;
};

/** Bloc de contexte listant les documents téléversés et leur état d'analyse. */
export function buildDocumentsContext(documents: DocContextItem[]): string {
  if (documents.length === 0) {
    return [
      "## DOCUMENTS",
      "Aucun document téléversé. Si le dirigeant mentionne un document utile (états financiers, plan d'affaires…), invite-le à le déposer dans l'onglet Documents pour que tu puisses l'analyser.",
    ].join("\n");
  }
  const lines = ["## DOCUMENTS (pièces téléversées par le dirigeant)"];
  for (const d of documents) {
    if (d.analysisStatus === "done") {
      lines.push(
        `- [${d.id}] ${d.name} — analysé${d.docType ? ` (${d.docType})` : ""}${
          d.summary ? ` : ${d.summary}` : ""
        }`
      );
    } else {
      lines.push(
        `- [${d.id}] ${d.name} — non analysé. Tu peux l'analyser avec analyze_document(${d.id}) si c'est un PDF ou un fichier texte.`
      );
    }
  }
  lines.push(
    "Quand un document non analysé peut clarifier le dossier (finances, offre, structure), propose de l'analyser puis utilise analyze_document."
  );
  return lines.join("\n");
}

export type CrmContextItem = {
  contacts: {
    id: string;
    name: string;
    type: string;
    organization?: string | null;
    priority?: string;
    nextAction?: string | null;
  }[];
  opportunities: {
    id: string;
    title: string;
    stage: string;
    type: string;
    contactId?: string | null;
    projectId?: string | null;
    value?: number | null;
    probability?: number | null;
    nextAction?: string | null;
  }[];
};

/** Bloc de contexte décrivant le CRM (contacts + opportunités). */
export function buildCrmContext(crm: CrmContextItem): string {
  const { contacts, opportunities } = crm;
  if (contacts.length === 0 && opportunities.length === 0) {
    return [
      "## CRM (contacts & opportunités)",
      "Aucun contact ni opportunité enregistré. Quand le dirigeant mentionne une personne clé (client, partenaire, conseiller, repreneur) ou une opportunité (vente, partenariat, cession…), enregistre-la avec create_contact / create_opportunity.",
    ].join("\n");
  }
  const lines = ["## CRM (contacts & opportunités du dirigeant)"];
  if (contacts.length > 0) {
    lines.push("Contacts :");
    for (const c of contacts.slice(0, 30)) {
      const extras = [
        c.organization ? `org: ${c.organization}` : null,
        c.priority && c.priority !== "normal" ? `priorité ${c.priority}` : null,
        c.nextAction ? `prochaine action: ${c.nextAction}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `- [${c.id}] ${c.name} — ${c.type}${extras ? ` (${extras})` : ""}`
      );
    }
  }
  if (opportunities.length > 0) {
    lines.push("Opportunités :");
    for (const o of opportunities.slice(0, 30)) {
      const extras = [
        o.contactId ? `contact_id: ${o.contactId}` : null,
        o.projectId ? `project_id: ${o.projectId}` : null,
        o.value != null ? `${o.value} $ CAD` : null,
        o.probability != null ? `${o.probability} %` : null,
        o.nextAction ? `prochaine action: ${o.nextAction}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `- [${o.id}] « ${o.title} » — ${o.type}, étape ${o.stage}${extras ? ` (${extras})` : ""}`
      );
    }
  }
  lines.push(
    "Outils CRM : create_contact, update_contact, delete_contact, create_opportunity, update_opportunity, delete_opportunity. Utilise les IDs du contexte. Fais avancer les étapes quand l'échange le justifie ; mets à jour contacts et opportunités existants plutôt que d'en créer des doublons."
  );
  return lines.join("\n");
}

export type ProjectContextItem = {
  id: string;
  name: string;
  status: string;
  objective?: string | null;
  folders: { id: string; name: string }[];
  openTasks: number;
  docCount: number;
};

const PROJECT_STATUS_FR: Record<string, string> = {
  active: "actif",
  on_hold: "en pause",
  done: "terminé",
  archived: "archivé",
};

/** Bloc de contexte décrivant les projets et leurs dossiers. */
export function buildProjectsContext(projects: ProjectContextItem[]): string {
  if (projects.length === 0) {
    return [
      "## PROJETS",
      "Aucun projet créé. Quand l'échange révèle un chantier structurant et distinct (cession, levée de fonds, subvention, partenariat…), propose de créer un projet avec create_project pour y regrouper dossiers, documents et tâches.",
    ].join("\n");
  }
  const lines = ["## PROJETS (espaces de travail du dirigeant)"];
  for (const p of projects.slice(0, 20)) {
    const status = PROJECT_STATUS_FR[p.status] ?? p.status;
    lines.push(
      `- [${p.id}] « ${p.name} » — ${status}${
        p.objective ? `, objectif : ${p.objective}` : ""
      } · ${p.openTasks} tâche(s) ouverte(s), ${p.docCount} document(s)`
    );
    if (p.folders.length > 0) {
      lines.push(
        `  Dossiers : ${p.folders
          .map((f) => `[${f.id}] ${f.name}`)
          .join(", ")}`
      );
    } else {
      lines.push("  Dossiers : aucun (tu peux en créer avec create_project_folder).");
    }
  }
  lines.push(
    "Pour agir sur un projet : create_project_folder (organiser), create_tasks avec project_id (ajouter des actions), generate_document avec project_id + folder_id (produire et ranger un livrable), update_project (statut/objectif)."
  );
  return lines.join("\n");
}

const NOTE_KIND_LABELS: Record<EdenNote["kind"], string> = {
  sommet: "Sommet (vision 5 ans)",
  humain: "Contexte humain",
  entreprise: "Entreprise",
  fait: "Fait / jalon",
  preference: "Préférence",
};

/** Bloc de contexte décrivant la relation et la mémoire du tuteur. */
export function buildMemoryContext(
  relation: EdenRelationMeta,
  notes: EdenNote[],
  pastSummaries: PastConversationSummary[] = []
): string {
  const lines = ["## RELATION & MÉMOIRE DU TUTEUR"];

  if (!relation.lastExchangeAt) {
    lines.push(
      "Premier échange avec ce dirigeant. Applique pleinement la règle « l'humain avant l'entreprise » : accueille, demande ce qui l'amène, ne plonge pas tout de suite dans les chiffres."
    );
  } else {
    const days = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(relation.lastExchangeAt).getTime()) / 86_400_000
      )
    );
    const recency =
      days === 0
        ? "dernier échange aujourd'hui"
        : days === 1
          ? "dernier échange hier"
          : `dernier échange il y a ${days} jours`;
    lines.push(
      `Dirigeant déjà connu : ${relation.conversationCount} conversation(s), ${recency}. Ne te représente pas, ne repose pas les questions de base déjà mémorisées : repars de là où vous en étiez.`
    );
    if (days > 5) {
      lines.push(
        "Plus de 5 jours sans échange : ouvre par un bref point d'étape chaleureux — où en est-il sur les priorités de la dernière fois ? S'il y a des tâches en retard dans le plan d'action, c'est le moment d'en parler avec tact."
      );
    }
  }

  if (pastSummaries.length > 0) {
    lines.push("Vos dernières conversations (de la plus récente à la plus ancienne) :");
    for (const s of pastSummaries.slice(0, 3)) {
      lines.push(`- « ${s.title} » : ${s.summary}`);
    }
    lines.push(
      "Si le dirigeant fait référence à un échange passé, appuie-toi sur ces résumés pour reprendre le fil sans lui faire répéter."
    );
  }

  if (notes.length === 0) {
    lines.push(
      "Mémoire vide pour l'instant. Dès que le dirigeant révèle son sommet, ce qui l'amène, un fait d'entreprise clé ou une préférence durable, enregistre-le avec l'outil remember."
    );
  } else {
    lines.push("Ce que tu as retenu des échanges précédents :");
    const order: EdenNote["kind"][] = [
      "sommet",
      "humain",
      "entreprise",
      "fait",
      "preference",
    ];
    const sorted = [...notes].sort(
      (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)
    );
    for (const n of sorted.slice(0, 20)) {
      lines.push(`- [${NOTE_KIND_LABELS[n.kind]}] ${n.content}`);
    }
    lines.push(
      "Appuie-toi sur ces notes sans les réciter mot à mot. Complète-les avec remember quand une information durable nouvelle apparaît ; pour le sommet et le contexte humain, remember remplace la note existante."
    );
  }

  return lines.join("\n");
}

const CRITERION_MARK: Record<CriterionStatus, string> = {
  met: "✓",
  partial: "◐",
  unmet: "✗",
  unknown: "?",
};

const CRITERION_HINT: Record<CriterionStatus, string> = {
  met: "atteint",
  partial: "en progrès",
  unmet: "à travailler",
  unknown: "à découvrir avec le dirigeant",
};

/** Bloc DESTINATION : le point B et la distance qui reste (cœur du rôle de tuteur). */
export function buildDestinationContext(
  destination: Destination | null
): string {
  if (!destination) {
    return [
      "## DESTINATION — LE POINT B",
      "Pas encore de destination claire : l'intention ou le diagnostic manquent. Ta première mission de tuteur, c'est de faire émerger où cette personne veut amener son entreprise (le point B), puis de jalonner le chemin pour y arriver.",
    ].join("\n");
  }
  const lines = [
    "## DESTINATION — LE POINT B",
    `Objectif d'arrivée (${destination.intentionLabel}) : ${destination.label}.`,
    `Ce que « prêt » veut dire : ${destination.summary}`,
    `Avancement vers la destination : ${destination.metCount}/${destination.total} critères atteints (~${destination.progressPct} %).`,
    "Critères :",
    ...destination.criteria.map(
      (c) => `- ${CRITERION_MARK[c.status]} ${c.label} (${CRITERION_HINT[c.status]})`
    ),
    "Pilote la relation comme un tuteur qui mène d'un point A à un point B : à chaque échange, situe la personne sur ce chemin et fais avancer LE critère le plus utile maintenant, sans tout empiler. Les critères marqués « ? » ne sont pas encore connus — découvre-les en conversation, puis mémorise tes constats avec l'outil remember.",
  ];
  return lines.join("\n");
}

const MILESTONE_MARK: Record<MilestoneStatus, string> = {
  done: "✓",
  in_progress: "▶",
  todo: "○",
};

/** Bloc PROGRAMME : l'itinéraire jalonné vers le point B (plan de fond persistant). */
export function buildProgramContext(milestones: ProgramMilestone[]): string {
  if (milestones.length === 0) {
    return [
      "## PROGRAMME (jalons vers le point B)",
      "Pas encore de programme jalonné — il se construit dès que l'intention et le diagnostic sont posés.",
    ].join("\n");
  }
  const total = milestones.length;
  const done = milestones.filter((m) => m.status === "done").length;
  const next = nextOpenMilestone(milestones);
  const lines = [
    "## PROGRAMME (jalons vers le point B)",
    `L'itinéraire complet de l'entreprise vers sa destination, en jalons ordonnés : ${done}/${total} franchis. C'est le plan de fond — réfères-y pour situer la personne (« jalon ${Math.min(done + 1, total)} sur ${total} ») et faire avancer un jalon à la fois, dans l'ordre.`,
  ];
  milestones.forEach((m, i) => {
    const open = m.status !== "done";
    const date = m.targetDate && open ? ` — échéance ${m.targetDate}` : "";
    const idPart = open ? ` [id: ${m.id}]` : "";
    lines.push(`${i + 1}. ${MILESTONE_MARK[m.status]} ${m.title}${date}${idPart}`);
  });
  if (next) {
    lines.push(`Prochain jalon à faire avancer : « ${next.title} ».`);
  } else {
    lines.push(
      "Tous les jalons sont franchis — l'entreprise a atteint sa destination actuelle. Félicite sobrement, puis ouvre la suite (palier supérieur, préparation du matching à venir)."
    );
  }
  lines.push(
    "Quand un jalon « à découvrir » est confirmé par le dirigeant (valorisation, problème nommé, critères de cible…), marque-le avec update_milestone. Rattache les actions que tu crées au jalon qu'elles servent (create_tasks avec milestone_id) ; ne crée pas une tâche hors programme si elle fait avancer un jalon existant."
  );
  return lines.join("\n");
}

/** Ligne de progression du score dans le temps (récit du chemin parcouru). */
export function buildProgressionLine(history: ScoreHistoryPoint[]): string {
  const series = compactProgression(history);
  if (series.length < 2) return "";
  const shown = series.slice(-6);
  const start = shown[0];
  const now = shown[shown.length - 1];
  const trend =
    now > start
      ? `en hausse (+${now - start} depuis le début du suivi)`
      : now < start
        ? `en baisse (${now - start} depuis le début du suivi)`
        : "stable";
  return [
    "## PROGRESSION DU SCORE",
    `Trajectoire du score : ${shown.join(" → ")} — ${trend}.`,
    "Reflète ce chemin parcouru au dirigeant quand c'est porteur (un palier franchi, une remontée après un effort) — sans le réciter à chaque message.",
  ].join("\n");
}

/**
 * System prompt complet = identité Eden + destination (point B) + contexte
 * dossier + progression + plan d'action + documents + CRM + projets + consignes.
 */
export function buildEdenSystemPrompt(
  submission: DiagnosticSubmission | null,
  profile: EdenProfile,
  tasks: Task[] = [],
  documents: DocContextItem[] = [],
  crm: CrmContextItem = { contacts: [], opportunities: [] },
  projects: ProjectContextItem[] = [],
  relation: EdenRelationMeta = { conversationCount: 1, lastExchangeAt: null },
  notes: EdenNote[] = [],
  pastSummaries: PastConversationSummary[] = [],
  scoreHistory: ScoreHistoryPoint[] = [],
  program: ProgramMilestone[] = []
): string {
  const docSignals: DossierDocSignal[] = documents.map((d) => ({
    name: d.name,
    docType: d.docType ?? null,
    analyzed: d.analysisStatus === "done",
  }));
  const destination = submission
    ? evaluateDestination(submission, docSignals)
    : null;
  const progressionLine = buildProgressionLine(scoreHistory);
  return [
    EDEN_SYSTEM_PROMPT,
    "",
    buildMemoryContext(relation, notes, pastSummaries),
    "",
    buildDestinationContext(destination),
    "",
    buildProgramContext(program),
    ...(progressionLine ? ["", progressionLine] : []),
    "",
    buildDossierContext(submission, profile),
    "",
    buildTasksContext(tasks),
    "",
    buildDocumentsContext(documents),
    "",
    buildCrmContext(crm),
    "",
    buildProjectsContext(projects),
    "",
    "## UTILISATION DU CONTEXTE",
    "- Tu es un tuteur qui mène l'entreprise d'un point A vers un point B : garde la DESTINATION ci-dessus en tête à chaque échange, situe où en est la personne, et fais avancer le critère le plus utile maintenant — pas dix à la fois.",
    "- Les critères de destination marqués « ? » sont à découvrir en conversation (les poser au bon moment, sans interroger en rafale), puis à consigner avec remember pour qu'ils deviennent visibles dans le suivi.",
    "- Séquence le chemin comme un tuteur : ne pousse pas une optimisation tant que les fondations (structure juridique, offre claire, finances lisibles) ne tiennent pas. Appuie-toi sur la phase du parcours indiquée dans le dossier et fais progresser les critères de la DESTINATION dans un ordre qui a du sens — un jalon à la fois.",
    "- Appuie-toi sur ce dossier : cite le score, les dimensions faibles, l'objectif. Sois concret et personnalisé.",
    "- Tu disposes d'outils pour ENRICHIR le dossier en direct (mettre à jour la structure juridique, l'offre, des réponses, analyser un lien REQ ou un site web, recalculer le score).",
    "- Quand la personne te donne une information exploitable (forme juridique, année de création, nombre de dirigeants, description de l'offre, lien REQ/site, situation financière), utilise l'outil approprié pour l'enregistrer, puis recalcule le score si pertinent.",
    "- Après une mise à jour de score, annonce la nouvelle valeur et ce qui a changé, brièvement.",
    "- Ne demande pas une information déjà présente dans le dossier. Avance vers la prochaine action.",
    "",
    "## PLAN D'ACTION — RÈGLES",
    "- Quand un échange débouche sur des actions concrètes, crée des tâches datées avec create_tasks (verbe d'action + échéance réaliste).",
    "- Maximum 3 tâches Eden actives par semaine. Si le quota est atteint, aide d'abord à terminer ou reprogrammer l'existant plutôt que d'en ajouter.",
    "- Si la personne dit avoir fait, reporté ou être bloquée sur une tâche listée ci-dessus, utilise update_task avec son identifiant.",
    "- Avant de marquer faite une tâche à fort enjeu (priorité haute), assure-toi brièvement que c'est réellement bouclé : « Qu'est-ce qui te fait dire que c'est réglé ? » Un tuteur demande une preuve sur ce qui compte — sans tatillonner sur les petites tâches.",
    "- Félicite brièvement et sincèrement quand une tâche est complétée, et relie-la au point B : ce critère de la destination vient d'avancer.",
    "- Face à une tâche EN RETARD ou bloquée, ne reprogramme JAMAIS d'emblée. Demande d'abord, en une seule question, ce qui a coincé (manque de temps ? information manquante ? étape pas claire ? attente d'un tiers ?). Tu adaptes ENSUITE — redater, décomposer, retirer ou orienter vers un expert — selon ce que la personne répond. La curiosité avant la solution. Ne reprends pas la même liste de tâches en la redatant comme un robot : parle-lui d'abord.",
    "- N'empile pas, dans un même message, le rappel des tâches reprogrammées ET un récapitulatif « vos priorités ». C'est redondant : une seule formulation, en prose.",
    "- Le résultat de update_task contient le score recalculé (score, scoreDelta). Si scoreDelta ≠ 0, annonce le NOUVEAU score — le score du contexte ci-dessus est alors obsolète. Ne dis jamais que le score « reste » à une valeur sans avoir vérifié le résultat de l'outil.",
    "- Une tâche liée à une dimension : quand elle est faite, invite la personne à mettre à jour le dossier (l'info correspondante) pour faire progresser le score.",
    "",
    "## DOCUMENTS — RÈGLES",
    "- Si un document pertinent est listé comme « non analysé », propose de l'analyser puis appelle analyze_document avec son identifiant. Annonce ensuite le résumé et l'impact sur le score, brièvement.",
    "- Quand un livrable concret aiderait (fiche synthèse, plan d'action écrit, note de préparation), propose-le et utilise generate_document en rédigeant toi-même le contenu complet en Markdown. Le dirigeant pourra le télécharger.",
    "- Ne génère pas de document à chaque message — seulement quand c'est réellement utile et demandé ou clairement bénéfique.",
    "",
    "## CRM — RÈGLES",
    "- Quand le dirigeant évoque une personne clé (client, prospect, partenaire, conseiller, repreneur, investisseur), enregistre-la discrètement avec create_contact.",
    "- Quand l'échange révèle une opportunité concrète (vente, partenariat, cession, acquisition, financement), crée-la avec create_opportunity et relie-la à un contact si pertinent.",
    "- Fais avancer les opportunités d'étape avec update_opportunity quand le dirigeant rapporte un progrès. N'invente jamais de contact ni d'opportunité : appuie-toi sur ce qui est dit.",
    "",
    "## PROJETS — RÈGLES",
    "- Un projet est un espace de travail dédié à un chantier structurant (cession, levée, subvention, partenariat…). Crée-en un avec create_project quand l'échange en fait clairement émerger un, et confirme-le brièvement.",
    "- Pour un projet existant, rattache les actions à ce projet (create_tasks avec project_id), organise ses pièces en dossiers (create_project_folder) et range les livrables que tu génères dans le bon dossier (generate_document avec project_id + folder_id).",
    "- Avant de ranger un document dans un dossier, vérifie qu'un dossier adéquat existe dans le contexte PROJETS ; sinon crée-le d'abord.",
    "- Mets à jour le statut d'un projet (update_project) quand le dirigeant indique qu'il est en pause, terminé ou archivé. Ne crée jamais de projet en double : réutilise les identifiants du contexte.",
  ].join("\n");
}

/**
 * Outils d'Eden — permettent à l'IA d'enrichir le dossier d'entreprise en
 * direct (collecte automatique + déclarative), puis de recalculer le score.
 */

import { applyScoreBonus, calculateScore } from "@/lib/espace/score";
import { dueDateInDays, type PhaseId, type TaskPriority } from "@/lib/espace/tasks";
import type { SeedTask } from "@/lib/espace/task-templates";
import type { DiagnosticSubmission, DimensionId, Scale } from "@/lib/espace/types";

// ─────────────── Schémas exposés à OpenAI ───────────────

export const EDEN_TOOLS = [
  {
    type: "function",
    function: {
      name: "update_dossier",
      description:
        "Enregistre dans le dossier d'entreprise les informations données par le dirigeant (structure juridique, offre, situation financière). N'inclure QUE les champs réellement fournis. Le score est recalculé automatiquement.",
      parameters: {
        type: "object",
        properties: {
          formeJuridique: {
            type: "string",
            description: "Forme juridique (ex. Inc., SENC, entreprise individuelle).",
          },
          anneeCreation: {
            type: "string",
            description: "Année de création / immatriculation (ex. 2014).",
          },
          nbDirigeants: {
            type: "string",
            description: "Nombre de dirigeants / administrateurs.",
          },
          offre: {
            type: "string",
            description: "Ce que l'entreprise vend, en une phrase.",
          },
          publicCible: {
            type: "string",
            description: "À qui s'adresse l'offre (type de clientèle).",
          },
          reqUrl: { type: "string", description: "Lien vers la fiche REQ." },
          siteUrl: { type: "string", description: "Lien vers le site web." },
          finVisibilite: {
            type: "integer",
            enum: [1, 2, 3],
            description:
              "Visibilité financière : 3 = connaît sa marge nette précisément, 2 = approximativement, 1 = non/pas à jour.",
          },
          finDependanceClient: {
            type: "integer",
            enum: [1, 2, 3],
            description:
              "Dépendance client : 3 = clientèle diversifiée, 2 = un client important, 1 = un/deux clients font l'essentiel.",
          },
          finTendance: {
            type: "integer",
            enum: [1, 2, 3],
            description:
              "Tendance du chiffre d'affaires : 3 = croissance, 2 = stable, 1 = baisse/irrégulier.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_link",
      description:
        "Lit le contenu d'un lien (fiche REQ ou site web) fourni par le dirigeant et en extrait automatiquement les informations clés, qui sont enregistrées dans le dossier. Le score est recalculé.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["req", "site"],
            description: "req = fiche Registre des entreprises, site = site web.",
          },
          url: { type: "string", description: "URL à analyser." },
        },
        required: ["type", "url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_tasks",
      description:
        "Crée des tâches concrètes et datées dans le plan d'action du dirigeant. À utiliser à la fin d'un échange pour transformer les conseils en actions suivies. RÈGLE STRICTE : maximum 3 tâches actives par semaine — ne dépasse jamais ce que la personne peut réellement faire. Chaque tâche DOIT avoir une échéance précise en jours.",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            maxItems: 3,
            description: "Liste de 1 à 3 tâches.",
            items: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description:
                    "Action concrète commençant par un verbe (ex. « Identifier 3 prospects B2B »).",
                },
                description: {
                  type: "string",
                  description: "Contexte court : pourquoi cette action compte.",
                },
                due_in_days: {
                  type: "integer",
                  minimum: 1,
                  maximum: 30,
                  description: "Échéance en jours à partir d'aujourd'hui.",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                },
                dimension_id: {
                  type: "string",
                  enum: [
                    "clarte",
                    "independance",
                    "finances",
                    "structure",
                    "reputation",
                  ],
                  description:
                    "Dimension du score concernée, si pertinent.",
                },
                phase_id: {
                  type: "string",
                  enum: [
                    "diagnostic",
                    "fondations",
                    "structuration",
                    "optimisation",
                    "cercle",
                  ],
                },
              },
              required: ["title", "due_in_days"],
              additionalProperties: false,
            },
          },
          project_id: {
            type: "string",
            description:
              "Identifiant d'un projet (voir contexte PROJETS) pour rattacher ces tâches à ce projet. Laisse vide pour le plan d'action général.",
          },
          milestone_id: {
            type: "string",
            description:
              "Identifiant d'un jalon du PROGRAMME (voir contexte) que ces tâches font avancer. Rattache l'action au jalon concerné quand c'est pertinent.",
          },
        },
        required: ["tasks"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_milestone",
      description:
        "Fait avancer un jalon du PROGRAMME (l'itinéraire vers le point B). Sert surtout aux jalons « à découvrir » (marqués ?) que les données ne peuvent pas évaluer : quand le dirigeant confirme l'avancée (ex. il donne une valorisation, nomme son problème principal, définit ses critères de cible), marque le jalon in_progress ou done. Les jalons déjà fermés par les données ne doivent pas être touchés. Utilise l'identifiant fourni dans le contexte PROGRAMME.",
      parameters: {
        type: "object",
        properties: {
          milestone_id: { type: "string", description: "Identifiant du jalon." },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
          },
        },
        required: ["milestone_id", "status"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_project",
      description:
        "Crée un projet (espace de travail) pour le dirigeant : cession, levée de fonds, subvention, partenariat, chantier interne, etc. Un projet regroupe des dossiers, des documents et des tâches. À utiliser quand l'échange révèle un chantier structurant et distinct.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nom court et clair du projet (ex. « Cession 2027 »).",
          },
          objective: {
            type: "string",
            description: "Objectif du projet en une phrase, si connu.",
          },
          type: {
            type: "string",
            description: "Catégorie libre (ex. cession, financement, subvention).",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_project",
      description:
        "Met à jour un projet existant : son statut (active, on_hold, done, archived) ou son objectif. Utilise l'identifiant fourni dans le contexte PROJETS.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          status: {
            type: "string",
            enum: ["active", "on_hold", "done", "archived"],
          },
          objective: { type: "string" },
        },
        required: ["project_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_project_folder",
      description:
        "Crée un dossier à l'intérieur d'un projet pour organiser ses documents (ex. « Juridique », « Finances », « Livrables »). Utilise l'identifiant de projet du contexte PROJETS.",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Projet cible." },
          name: { type: "string", description: "Nom du dossier." },
        },
        required: ["project_id", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_document",
      description:
        "Analyse un document déjà téléversé par le dirigeant (PDF ou fichier texte) pour en extraire un résumé et des faits utiles, qui enrichissent le dossier et peuvent faire monter le score. Utilise l'identifiant de document fourni dans la section DOCUMENTS du contexte. N'invente jamais d'identifiant.",
      parameters: {
        type: "object",
        properties: {
          document_id: {
            type: "string",
            description: "Identifiant du document à analyser (voir contexte DOCUMENTS).",
          },
        },
        required: ["document_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_document",
      description:
        "Génère un document livrable pour le dirigeant (fiche synthèse, plan d'action, note de préparation, etc.) à partir du dossier et de l'échange. Tu rédiges toi-même le contenu complet en Markdown. Le dirigeant pourra le télécharger en PDF. À utiliser quand un livrable concret aide à avancer.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["one_pager", "action_plan", "prep_note", "custom"],
            description:
              "one_pager = fiche synthèse entreprise ; action_plan = plan d'action ; prep_note = note de préparation (cession, partenariat…) ; custom = autre.",
          },
          title: {
            type: "string",
            description: "Titre du document (ex. « Fiche synthèse — Entreprise X »).",
          },
          markdown: {
            type: "string",
            description:
              "Contenu COMPLET du document en Markdown (titres ##, listes, gras). Professionnel, concret, en français québécois. 1 à 2 pages.",
          },
          project_id: {
            type: "string",
            description:
              "Identifiant d'un projet (voir contexte PROJETS) pour ranger le document dans ce projet.",
          },
          folder_id: {
            type: "string",
            description:
              "Identifiant d'un dossier du projet (voir contexte PROJETS) pour y ranger le document. Requiert project_id.",
          },
        },
        required: ["type", "title", "markdown"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_contact",
      description:
        "Enregistre un contact dans le CRM du dirigeant (client, prospect, partenaire, conseiller, repreneur, investisseur…) quand il en mentionne un. N'enregistre que des personnes réelles évoquées dans l'échange.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nom de la personne." },
          contact_type: {
            type: "string",
            enum: [
              "client",
              "prospect",
              "partenaire",
              "conseiller",
              "repreneur",
              "investisseur",
              "fournisseur",
              "autre",
            ],
          },
          title: { type: "string", description: "Fonction / rôle." },
          organization: { type: "string", description: "Organisation." },
          email: { type: "string" },
          phone: { type: "string" },
          notes: { type: "string", description: "Contexte utile sur la relation." },
          priority: { type: "string", enum: ["high", "normal", "low"] },
          next_action: { type: "string", description: "Prochaine étape concrète." },
          next_action_date: {
            type: "string",
            description: "Date de la prochaine action (AAAA-MM-JJ).",
          },
          last_contacted_at: {
            type: "string",
            description: "Dernier contact (ISO 8601), si mentionné.",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_contact",
      description:
        "Met à jour un contact CRM existant (coordonnées, notes, priorité, prochaine action). Utilise contact_id du contexte CRM.",
      parameters: {
        type: "object",
        properties: {
          contact_id: { type: "string" },
          name: { type: "string" },
          contact_type: {
            type: "string",
            enum: [
              "client",
              "prospect",
              "partenaire",
              "conseiller",
              "repreneur",
              "investisseur",
              "fournisseur",
              "autre",
            ],
          },
          title: { type: "string" },
          organization: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          notes: { type: "string" },
          priority: { type: "string", enum: ["high", "normal", "low"] },
          next_action: { type: "string" },
          next_action_date: { type: "string" },
          last_contacted_at: { type: "string" },
        },
        required: ["contact_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_contact",
      description:
        "Supprime un contact CRM lorsque le dirigeant le demande explicitement. Utilise contact_id du contexte.",
      parameters: {
        type: "object",
        properties: {
          contact_id: { type: "string" },
        },
        required: ["contact_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_opportunity",
      description:
        "Crée une opportunité dans le pipeline du dirigeant (vente, partenariat, cession, acquisition, financement) quand l'échange en révèle une. Relie-la à un contact ou projet existant si pertinent (IDs du contexte).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Intitulé de l'opportunité." },
          opp_type: {
            type: "string",
            enum: [
              "commerce",
              "alliance",
              "cession",
              "acquisition",
              "financement",
              "autre",
            ],
          },
          stage: {
            type: "string",
            enum: [
              "qualification",
              "discussion",
              "proposition",
              "negociation",
              "gagne",
              "perdu",
            ],
          },
          value: {
            type: "number",
            description: "Valeur estimée en dollars canadiens, si connue.",
          },
          contact_id: {
            type: "string",
            description: "Identifiant d'un contact CRM lié (voir contexte).",
          },
          project_id: {
            type: "string",
            description: "Identifiant d'un projet lié (voir contexte PROJETS).",
          },
          notes: { type: "string" },
          priority: { type: "string", enum: ["high", "normal", "low"] },
          next_action: { type: "string" },
          expected_close_date: {
            type: "string",
            description: "Date de clôture prévue (AAAA-MM-JJ).",
          },
          probability: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Probabilité de gain en %.",
          },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_opportunity",
      description:
        "Met à jour une opportunité existante : étape, valeur, contact, projet, notes, priorité, prochaine action, probabilité. Utilise opportunity_id du contexte CRM.",
      parameters: {
        type: "object",
        properties: {
          opportunity_id: { type: "string" },
          title: { type: "string" },
          opp_type: {
            type: "string",
            enum: [
              "commerce",
              "alliance",
              "cession",
              "acquisition",
              "financement",
              "autre",
            ],
          },
          stage: {
            type: "string",
            enum: [
              "qualification",
              "discussion",
              "proposition",
              "negociation",
              "gagne",
              "perdu",
            ],
          },
          value: { type: "number" },
          contact_id: { type: "string" },
          project_id: { type: "string" },
          notes: { type: "string" },
          priority: { type: "string", enum: ["high", "normal", "low"] },
          next_action: { type: "string" },
          expected_close_date: { type: "string" },
          probability: { type: "integer", minimum: 0, maximum: 100 },
        },
        required: ["opportunity_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_opportunity",
      description:
        "Supprime une opportunité lorsque le dirigeant le demande explicitement. Utilise opportunity_id du contexte.",
      parameters: {
        type: "object",
        properties: {
          opportunity_id: { type: "string" },
        },
        required: ["opportunity_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remember",
      description:
        "Enregistre dans ta mémoire de tuteur une information durable révélée par le dirigeant : son sommet (vision 5 ans), ce qui l'amène (contexte humain), un fait d'entreprise clé (ventes, dépendance client, équipe…) ou une préférence durable. Utilise-le dès qu'une information mérite d'être retenue entre les conversations. Pour sommet et humain, la note existante est remplacée.",
      parameters: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["sommet", "humain", "entreprise", "fait", "preference"],
            description:
              "sommet = vision 5 ans · humain = ce qui l'amène, situation personnelle · entreprise = fait structurel (ventes, équipe, clients) · fait = événement ou jalon daté · preference = façon de travailler souhaitée.",
          },
          content: {
            type: "string",
            description:
              "La note, en une ou deux phrases factuelles. Pas de conseil, juste l'information.",
          },
        },
        required: ["kind", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description:
        "Met à jour une tâche existante du plan d'action : la marquer faite, la reporter à une nouvelle échéance, la marquer bloquée ou changer sa priorité. Utilise l'identifiant de tâche fourni dans le contexte du dossier.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "Identifiant de la tâche." },
          status: {
            type: "string",
            enum: ["pending", "in_progress", "done", "skipped", "blocked"],
          },
          due_in_days: {
            type: "integer",
            minimum: 0,
            maximum: 60,
            description: "Nouvelle échéance en jours (report).",
          },
          blocked_reason: {
            type: "string",
            description: "Raison du blocage, si status = blocked.",
          },
          proof_note: {
            type: "string",
            description:
              "Preuve courte de complétion quand le dirigeant explique comment la tâche a été réglée (ex. « 3 prospects appelés, 1 RDV »). À renseigner surtout pour les tâches à fort enjeu.",
          },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
          },
        },
        required: ["task_id"],
        additionalProperties: false,
      },
    },
  },
] as const;

// ─────────────── Application des mises à jour ───────────────

export type UpdateDossierArgs = {
  formeJuridique?: string;
  anneeCreation?: string;
  nbDirigeants?: string;
  offre?: string;
  publicCible?: string;
  reqUrl?: string;
  siteUrl?: string;
  finVisibilite?: number;
  finDependanceClient?: number;
  finTendance?: number;
};

function asScale(v: unknown): Scale | undefined {
  return v === 1 || v === 2 || v === 3 ? (v as Scale) : undefined;
}

/**
 * Applique des champs au dossier et renvoie la soumission mise à jour.
 * `bonus` = points d'élan en cours, réappliqués après recalcul du score brut
 * pour que le total effectif reste cohérent.
 */
export function applyDossierUpdate(
  submission: DiagnosticSubmission,
  args: UpdateDossierArgs,
  bonus = 0
): { submission: DiagnosticSubmission; changed: string[] } {
  const next: DiagnosticSubmission = { ...submission };
  const changed: string[] = [];

  if (args.formeJuridique || args.anneeCreation || args.nbDirigeants) {
    next.reqFallback = {
      formeJuridique:
        args.formeJuridique ?? next.reqFallback?.formeJuridique ?? "",
      anneeCreation:
        args.anneeCreation ?? next.reqFallback?.anneeCreation ?? "",
      nbDirigeants: args.nbDirigeants ?? next.reqFallback?.nbDirigeants ?? "",
    };
    changed.push("structure juridique");
  }

  if (args.offre || args.publicCible) {
    next.siteFallback = {
      offre: args.offre ?? next.siteFallback?.offre ?? "",
      publicCible: args.publicCible ?? next.siteFallback?.publicCible ?? "",
    };
    changed.push("offre");
  }

  if (args.reqUrl) {
    next.reqUrl = args.reqUrl;
    next.reqSkipped = false;
    changed.push("lien REQ");
  }
  if (args.siteUrl) {
    next.siteUrl = args.siteUrl;
    next.siteSkipped = false;
    changed.push("lien site");
  }

  const finA: Record<string, Scale> = { ...(next.answersBlocA ?? {}) };
  let finChanged = false;
  const v = asScale(args.finVisibilite);
  const d = asScale(args.finDependanceClient);
  const t = asScale(args.finTendance);
  if (v) {
    finA["fin-visibilite"] = v;
    finChanged = true;
  }
  if (d) {
    finA["fin-dependance-client"] = d;
    finChanged = true;
  }
  if (t) {
    finA["fin-tendance"] = t;
    finChanged = true;
  }
  if (finChanged) {
    next.answersBlocA = finA;
    changed.push("santé financière");
  }

  if (changed.length > 0) {
    const base = calculateScore(next);
    next.score = bonus > 0 ? applyScoreBonus(base, bonus) : base;
  }

  return { submission: next, changed };
}

// ─────────────── Analyse de lien (fetch serveur + extraction IA) ───────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "NedexiaBot/1.0 (+https://nedexia.com)" },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    return stripHtml(html);
  } catch {
    return null;
  }
}

const REQ_EXTRACT_PROMPT = `Tu extrais des informations d'une fiche du Registre des entreprises du Québec (REQ).
Réponds UNIQUEMENT en JSON valide avec ces clés (string, "" si absent) :
{"formeJuridique":"","anneeCreation":"","nbDirigeants":"","statut":""}
anneeCreation = année (4 chiffres) d'immatriculation. nbDirigeants = nombre d'administrateurs.`;

const SITE_EXTRACT_PROMPT = `Tu analyses la page d'accueil d'un site web d'entreprise.
Réponds UNIQUEMENT en JSON valide avec ces clés (string, "" si absent) :
{"offre":"","publicCible":"","secteur":""}
offre = ce que l'entreprise vend en une phrase courte. publicCible = type de clientèle (B2B/B2C, secteur).`;

export type AnalyzeResult = {
  ok: boolean;
  message: string;
  extracted?: Record<string, string>;
};

/** Lit une URL et extrait des champs structurés via l'IA. */
export async function analyzeLink(
  apiKey: string,
  model: string,
  type: "req" | "site",
  url: string
): Promise<{ result: AnalyzeResult; update: UpdateDossierArgs }> {
  const text = await fetchPageText(url);
  if (!text) {
    return {
      result: {
        ok: false,
        message:
          "Je n'ai pas réussi à lire cette page. Demande l'information directement au dirigeant.",
      },
      update: {},
    };
  }

  const prompt = type === "req" ? REQ_EXTRACT_PROMPT : SITE_EXTRACT_PROMPT;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Record<string, string>;

    const update: UpdateDossierArgs = {};
    if (type === "req") {
      if (parsed.formeJuridique) update.formeJuridique = parsed.formeJuridique;
      if (parsed.anneeCreation) update.anneeCreation = parsed.anneeCreation;
      if (parsed.nbDirigeants) update.nbDirigeants = parsed.nbDirigeants;
      update.reqUrl = url;
    } else {
      if (parsed.offre) update.offre = parsed.offre;
      if (parsed.publicCible) update.publicCible = parsed.publicCible;
      update.siteUrl = url;
    }

    return {
      result: {
        ok: true,
        message: "Page lue et informations extraites.",
        extracted: parsed,
      },
      update,
    };
  } catch {
    return {
      result: {
        ok: false,
        message: "Lecture du lien impossible pour le moment.",
      },
      update: {},
    };
  }
}

// ─────────────── Tâches (plan d'action) ───────────────

export type CreateTasksArgs = {
  tasks?: {
    title?: string;
    description?: string;
    due_in_days?: number;
    priority?: TaskPriority;
    dimension_id?: DimensionId;
    phase_id?: PhaseId;
  }[];
  project_id?: string;
  milestone_id?: string;
};

export type UpdateMilestoneArgs = {
  milestone_id?: string;
  status?: "todo" | "in_progress" | "done";
};

export type CreateProjectArgs = {
  name?: string;
  objective?: string;
  type?: string;
};

export type UpdateProjectArgs = {
  project_id?: string;
  status?: "active" | "on_hold" | "done" | "archived";
  objective?: string;
};

export type CreateProjectFolderArgs = {
  project_id?: string;
  name?: string;
};

export type AnalyzeDocumentArgs = {
  document_id?: string;
};

export type GenerateDocumentArgs = {
  type?: "one_pager" | "action_plan" | "prep_note" | "custom";
  title?: string;
  markdown?: string;
  project_id?: string;
  folder_id?: string;
};

export type GeneratedDocument = {
  type: string;
  title: string;
  markdown: string;
  projectId: string | null;
  folderId: string | null;
};

/** Valide et normalise les arguments de `generate_document`. */
export function buildGeneratedDocument(
  args: GenerateDocumentArgs
): GeneratedDocument | null {
  const title = typeof args.title === "string" ? args.title.trim() : "";
  const markdown = typeof args.markdown === "string" ? args.markdown.trim() : "";
  if (!title || markdown.length < 20) return null;
  const type =
    args.type === "one_pager" ||
    args.type === "action_plan" ||
    args.type === "prep_note"
      ? args.type
      : "custom";
  return {
    type,
    title: title.slice(0, 160),
    markdown: markdown.slice(0, 12_000),
    projectId: typeof args.project_id === "string" ? args.project_id : null,
    folderId: typeof args.folder_id === "string" ? args.folder_id : null,
  };
}

export type RememberArgs = {
  kind?: string;
  content?: string;
};

export type UpdateTaskArgs = {
  task_id?: string;
  status?: "pending" | "in_progress" | "done" | "skipped" | "blocked";
  due_in_days?: number;
  blocked_reason?: string;
  proof_note?: string;
  priority?: TaskPriority;
};

export type CreateContactArgs = {
  name?: string;
  contact_type?: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  notes?: string;
  priority?: string;
  next_action?: string;
  next_action_date?: string;
  last_contacted_at?: string;
};

export type UpdateContactArgs = {
  contact_id?: string;
  name?: string;
  contact_type?: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  notes?: string;
  priority?: string;
  next_action?: string;
  next_action_date?: string;
  last_contacted_at?: string;
};

export type DeleteContactArgs = {
  contact_id?: string;
};

export type CreateOpportunityArgs = {
  title?: string;
  opp_type?: string;
  stage?: string;
  value?: number;
  contact_id?: string;
  project_id?: string;
  notes?: string;
  priority?: string;
  next_action?: string;
  expected_close_date?: string;
  probability?: number;
};

export type UpdateOpportunityArgs = {
  opportunity_id?: string;
  title?: string;
  opp_type?: string;
  stage?: string;
  value?: number;
  contact_id?: string;
  project_id?: string;
  notes?: string;
  priority?: string;
  next_action?: string;
  expected_close_date?: string;
  probability?: number;
};

export type DeleteOpportunityArgs = {
  opportunity_id?: string;
};

const VALID_PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

/** Convertit les arguments de `create_tasks` en graines de tâches validées (max 3). */
export function buildSeedTasksFromArgs(args: CreateTasksArgs): SeedTask[] {
  const items = Array.isArray(args.tasks) ? args.tasks.slice(0, 3) : [];
  const seeds: SeedTask[] = [];
  for (const item of items) {
    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (!title) continue;
    const days =
      typeof item.due_in_days === "number" && item.due_in_days > 0
        ? Math.min(Math.round(item.due_in_days), 60)
        : 7;
    const priority = VALID_PRIORITIES.includes(item.priority as TaskPriority)
      ? (item.priority as TaskPriority)
      : "medium";
    seeds.push({
      title: title.slice(0, 200),
      description:
        typeof item.description === "string" ? item.description.slice(0, 600) : "",
      dueDate: dueDateInDays(days),
      priority,
      dimensionId: (item.dimension_id as DimensionId) ?? null,
      phaseId: (item.phase_id as PhaseId) ?? null,
    });
  }
  return seeds;
}

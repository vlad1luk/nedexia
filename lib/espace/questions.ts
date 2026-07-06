/**
 * Catalogue de questions du tunnel de diagnostic.
 *
 * Chaque question rapporte une note 1 (faible) → 3 (solide), associée à
 * une dimension du score. Voir `score.ts` pour la formule.
 */

import type { DimensionId, Intention } from "./types";

export type QuestionOption = {
  label: string;
  value: 1 | 2 | 3;
};

export type Question = {
  id: string;
  /** Petit titre court (catégorie de la question) */
  title: string;
  prompt: string;
  options: QuestionOption[];
  dimension: DimensionId;
};

// ─────────────── Écran 4 — Bloc A · Finances ───────────────

export const BLOC_A_FINANCES: Question[] = [
  {
    id: "fin-visibilite",
    title: "Visibilité financière",
    prompt:
      "Connaissez-vous votre marge nette des 3 dernières années ?",
    dimension: "finances",
    options: [
      { label: "Oui, précisément", value: 3 },
      { label: "Approximativement", value: 2 },
      { label: "Non / pas à jour", value: 1 },
    ],
  },
  {
    id: "fin-dependance-client",
    title: "Dépendance client",
    prompt:
      "Un seul client représente-t-il plus de 30 % de votre chiffre d'affaires ?",
    dimension: "finances",
    options: [
      { label: "Non, clientèle diversifiée", value: 3 },
      { label: "Oui, un client important", value: 2 },
      { label: "Oui, un ou deux clients font l'essentiel", value: 1 },
    ],
  },
  {
    id: "fin-tendance",
    title: "Tendance",
    prompt:
      "Sur les 2 dernières années, votre chiffre d'affaires est plutôt…",
    dimension: "finances",
    options: [
      { label: "En croissance", value: 3 },
      { label: "Stable", value: 2 },
      { label: "En baisse ou irrégulier", value: 1 },
    ],
  },
];

// ─────────────── Écran 4 — Bloc B · Indépendance ───────────────

export const BLOC_B_INDEPENDANCE: Question[] = [
  {
    id: "ind-fondateur",
    title: "Dépendance fondateur",
    prompt:
      "Si vous deviez vous absenter 1 mois sans contact, votre entreprise tournerait…",
    dimension: "independance",
    options: [
      { label: "Sans problème, l'équipe sait quoi faire", value: 3 },
      { label: "Avec quelques décisions à reporter", value: 2 },
      { label: "Difficilement — beaucoup passe par moi", value: 1 },
    ],
  },
  {
    id: "ind-equipe",
    title: "Autonomie de l'équipe",
    prompt:
      "Les fonctions critiques (vente, opérations, finances) sont assurées par…",
    dimension: "independance",
    options: [
      { label: "Plusieurs personnes, chacune avec un suppléant", value: 3 },
      { label: "Une personne par fonction, sans suppléant", value: 2 },
      { label: "Moi-même sur l'essentiel", value: 1 },
    ],
  },
  {
    id: "ind-fournisseur",
    title: "Dépendance fournisseur",
    prompt:
      "Si votre principal fournisseur disparaissait demain, vous pourriez…",
    dimension: "independance",
    options: [
      { label: "Le remplacer en quelques semaines sans casse", value: 3 },
      { label: "Vous adapter, mais avec un impact", value: 2 },
      { label: "Avoir un sérieux problème opérationnel", value: 1 },
    ],
  },
];

// ─────────────── Écran 4 — Bloc C · Réputation ───────────────

export const BLOC_C_REPUTATION: Question[] = [
  {
    id: "rep-avis",
    title: "Avis publics",
    prompt:
      "Avez-vous des avis clients publics (Google, témoignages, études de cas) ?",
    dimension: "reputation",
    options: [
      { label: "Oui, suffisamment pour rassurer un prospect", value: 3 },
      { label: "Quelques-uns, à structurer", value: 2 },
      { label: "Très peu / aucun", value: 1 },
    ],
  },
  {
    id: "rep-references",
    title: "Clients de référence",
    prompt:
      "Pouvez-vous citer 3 clients prestigieux ou représentatifs prêts à recommander votre entreprise ?",
    dimension: "reputation",
    options: [
      { label: "Oui, sans hésiter", value: 3 },
      { label: "1 ou 2 sûrs, les autres à confirmer", value: 2 },
      { label: "Non, pas vraiment", value: 1 },
    ],
  },
  {
    id: "rep-presence",
    title: "Présence professionnelle",
    prompt:
      "Votre entreprise a-t-elle une présence professionnelle visible (site, LinkedIn, médias) ?",
    dimension: "reputation",
    options: [
      { label: "Oui, soignée et à jour", value: 3 },
      { label: "Présente mais à actualiser", value: 2 },
      { label: "Quasi-absente", value: 1 },
    ],
  },
];

export const ALL_BLOC_A = BLOC_A_FINANCES;
export const ALL_BLOC_B = BLOC_B_INDEPENDANCE;
export const ALL_BLOC_C = BLOC_C_REPUTATION;

// ─────────────── Écran 5 — Questions spécifiques selon intention ───────────────

export const QUESTIONS_INTENTION: Record<Intention, Question[]> = {
  commerce: [
    {
      id: "int-commerce-message",
      title: "Message commercial",
      prompt:
        "Vos prospects comprennent-ils en moins de 30 secondes ce que vous vendez et à qui ?",
      dimension: "clarte",
      options: [
        { label: "Oui, c'est limpide", value: 3 },
        { label: "Globalement, mais à clarifier", value: 2 },
        { label: "Non, c'est souvent confus", value: 1 },
      ],
    },
    {
      id: "int-commerce-cible",
      title: "Ciblage",
      prompt:
        "Avez-vous identifié précisément votre type de client idéal ?",
      dimension: "clarte",
      options: [
        { label: "Oui, profil clair avec critères", value: 3 },
        { label: "Globalement, intuitivement", value: 2 },
        { label: "Pas encore", value: 1 },
      ],
    },
  ],
  alliance: [
    {
      id: "int-alliance-quoi",
      title: "Recherche partenaire",
      prompt:
        "Savez-vous précisément ce que vous cherchez chez un partenaire stratégique ?",
      dimension: "clarte",
      options: [
        { label: "Oui, complémentarités définies", value: 3 },
        { label: "Une idée générale", value: 2 },
        { label: "Pas encore", value: 1 },
      ],
    },
    {
      id: "int-alliance-offrir",
      title: "Apport à un partenaire",
      prompt:
        "Pouvez-vous formuler en une phrase ce que vous apportez à un partenaire ?",
      dimension: "clarte",
      options: [
        { label: "Oui, sans hésiter", value: 3 },
        { label: "Avec quelques mots de plus", value: 2 },
        { label: "Non, à travailler", value: 1 },
      ],
    },
  ],
  cession: [
    {
      id: "int-cession-horizon",
      title: "Horizon de cession",
      prompt:
        "À quelle échéance envisagez-vous la cession ?",
      dimension: "structure",
      options: [
        { label: "3 à 5 ans — j'ai le temps de préparer", value: 3 },
        { label: "1 à 2 ans — la fenêtre se rapproche", value: 2 },
        { label: "Moins d'un an — urgent", value: 1 },
      ],
    },
    {
      id: "int-cession-prets",
      title: "Documents disponibles",
      prompt:
        "Vos documents clés (états financiers, contrats, organigramme) sont-ils prêts à être présentés ?",
      dimension: "structure",
      options: [
        { label: "Oui, organisés et à jour", value: 3 },
        { label: "Partiellement", value: 2 },
        { label: "Non, à reconstituer", value: 1 },
      ],
    },
  ],
  acquisition: [
    {
      id: "int-acq-profil",
      title: "Profil cible",
      prompt:
        "Avez-vous défini précisément le profil d'entreprise que vous cherchez à acquérir ?",
      dimension: "clarte",
      options: [
        { label: "Oui, critères précis", value: 3 },
        { label: "Idée générale du secteur", value: 2 },
        { label: "Pas encore", value: 1 },
      ],
    },
    {
      id: "int-acq-capacite",
      title: "Capacité financière",
      prompt:
        "Avez-vous une vision claire de votre capacité de financement pour une acquisition ?",
      dimension: "finances",
      options: [
        { label: "Oui, montants et leviers identifiés", value: 3 },
        { label: "Une enveloppe approximative", value: 2 },
        { label: "Non, à explorer", value: 1 },
      ],
    },
  ],
  structuration: [
    {
      id: "int-struct-prio",
      title: "Priorités",
      prompt:
        "Avez-vous identifié vos 3 priorités stratégiques pour les 12 prochains mois ?",
      dimension: "clarte",
      options: [
        { label: "Oui, écrites et partagées", value: 3 },
        { label: "Dans ma tête, pas formalisées", value: 2 },
        { label: "Non, à clarifier", value: 1 },
      ],
    },
  ],
  exploration: [
    {
      id: "int-expl-frein",
      title: "Frein principal",
      prompt:
        "Qu'est-ce qui freine le plus votre entreprise aujourd'hui ?",
      dimension: "clarte",
      options: [
        { label: "Rien de critique, je veux juste progresser", value: 3 },
        { label: "Un point précis que je connais", value: 2 },
        { label: "Plusieurs points sans priorité claire", value: 1 },
      ],
    },
  ],
};

/** Réactions d'Eden après le choix d'intention · écran 1 */
export const INTENTION_REACTIONS: Record<Intention, string> = {
  commerce:
    "Parfait. On va regarder si votre offre est prête à être présentée aux bonnes entreprises.",
  alliance:
    "Très bien. On commence par lire votre socle pour identifier les partenaires qui auraient du sens.",
  cession:
    "Compris. Préparer une transmission, ça se joue souvent 2 à 3 ans à l'avance — vous prenez les choses au bon moment.",
  acquisition:
    "Reçu. On va d'abord clarifier votre profil acquéreur avant de regarder les opportunités.",
  structuration:
    "Bien noté. On va poser les bases pour que la croissance ait quelque chose de solide sur quoi s'appuyer.",
  exploration:
    "Aucun souci, c'est très fréquent. Une question de plus va m'aider à vous orienter.",
};

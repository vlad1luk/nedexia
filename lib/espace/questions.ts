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
  /** Pourquoi Eden pose la question — affiché sous le prompt pour donner du sens. */
  help?: string;
  options: QuestionOption[];
  dimension: DimensionId;
};

// ─────────────── Écran 4 — Bloc A · Finances ───────────────

export const BLOC_A_FINANCES: Question[] = [
  {
    id: "fin-visibilite",
    title: "Visibilité financière",
    prompt:
      "Si un partenaire sérieux vous demandait vos marges des 3 dernières années, pourriez-vous répondre ?",
    help:
      "Des chiffres lisibles sont le premier signal de confiance — c'est la première chose qu'un partenaire ou un acheteur regarde.",
    dimension: "finances",
    options: [
      { label: "Oui, je les connais précisément", value: 3 },
      { label: "En ordre de grandeur, sans les chiffres exacts", value: 2 },
      { label: "Non — mes états ne sont pas à jour", value: 1 },
    ],
  },
  {
    id: "fin-dependance-client",
    title: "Dépendance client",
    prompt:
      "Quelle part de votre chiffre d'affaires dépend de votre plus gros client ?",
    help:
      "Au-delà de 30 %, la perte d'un seul client peut fragiliser toute l'entreprise — un point que tout acquéreur ou partenaire vérifie.",
    dimension: "finances",
    options: [
      { label: "Moins de 30 % — clientèle diversifiée", value: 3 },
      { label: "Entre 30 et 50 % — un client pèse lourd", value: 2 },
      { label: "Plus de 50 % — un ou deux clients font l'essentiel", value: 1 },
    ],
  },
  {
    id: "fin-tendance",
    title: "Trajectoire",
    prompt:
      "Sur les 2 dernières années, comment évolue votre chiffre d'affaires ?",
    help:
      "La trajectoire compte plus que le montant : elle dit si votre modèle gagne ou perd du terrain.",
    dimension: "finances",
    options: [
      { label: "En croissance régulière", value: 3 },
      { label: "Stable, sans grande variation", value: 2 },
      { label: "En baisse ou en dents de scie", value: 1 },
    ],
  },
];

// ─────────────── Écran 4 — Bloc B · Indépendance ───────────────

export const BLOC_B_INDEPENDANCE: Question[] = [
  {
    id: "ind-fondateur",
    title: "Le test du mois d'absence",
    prompt:
      "Imaginez : vous partez 1 mois, injoignable. Que se passe-t-il dans votre entreprise ?",
    help:
      "C'est le test classique de la valeur transmissible : une entreprise qui dépend de son fondateur vaut moins qu'une entreprise qui tourne seule.",
    dimension: "independance",
    options: [
      { label: "Elle tourne — l'équipe sait quoi faire sans moi", value: 3 },
      { label: "Elle tient, mais des décisions s'accumulent", value: 2 },
      { label: "Elle cale — presque tout passe par moi", value: 1 },
    ],
  },
  {
    id: "ind-equipe",
    title: "Personnes clés",
    prompt:
      "Qui tient les fonctions critiques — ventes, opérations, finances ?",
    help:
      "Chaque fonction portée par une seule personne (surtout vous) est un point de fragilité qu'un partenaire va relever.",
    dimension: "independance",
    options: [
      { label: "Des responsables identifiés, avec des relais en cas d'absence", value: 3 },
      { label: "Une personne par fonction, sans relais", value: 2 },
      { label: "Moi-même sur l'essentiel des fonctions", value: 1 },
    ],
  },
  {
    id: "ind-fournisseur",
    title: "Chaîne d'approvisionnement",
    prompt:
      "Si votre fournisseur ou sous-traitant principal disparaissait demain, que feriez-vous ?",
    help:
      "La dépendance ne vient pas que des clients : un maillon unique en amont peut bloquer toute la livraison.",
    dimension: "independance",
    options: [
      { label: "Je le remplace en quelques semaines, sans casse", value: 3 },
      { label: "Je m'adapte, avec un impact réel mais gérable", value: 2 },
      { label: "J'aurais un sérieux problème opérationnel", value: 1 },
    ],
  },
];

// ─────────────── Écran 4 — Bloc C · Réputation ───────────────

export const BLOC_C_REPUTATION: Question[] = [
  {
    id: "rep-avis",
    title: "Preuves publiques",
    prompt:
      "Un prospect qui vous cherche sur Google avant de vous rappeler — que trouve-t-il ?",
    help:
      "Aujourd'hui, la première vérification se fait en ligne, avant même le premier appel. Ce qu'on y trouve décide souvent de la suite.",
    dimension: "reputation",
    options: [
      { label: "Des avis et témoignages qui rassurent", value: 3 },
      { label: "Quelques traces, mais rien de structuré", value: 2 },
      { label: "Presque rien", value: 1 },
    ],
  },
  {
    id: "rep-references",
    title: "Clients ambassadeurs",
    prompt:
      "Si je vous demandais 3 clients prêts à recommander votre entreprise au téléphone, vous pourriez me les nommer ?",
    help:
      "Les références vérifiables sont la monnaie de confiance du B2B — elles pèsent plus qu'une plaquette commerciale.",
    dimension: "reputation",
    options: [
      { label: "Oui, sans hésiter — j'ai les noms", value: 3 },
      { label: "1 ou 2 sûrs, les autres à confirmer", value: 2 },
      { label: "Non, pas vraiment", value: 1 },
    ],
  },
  {
    id: "rep-presence",
    title: "Vitrine professionnelle",
    prompt:
      "Votre présence en ligne (site, LinkedIn, médias) reflète-t-elle le vrai niveau de votre entreprise ?",
    help:
      "Une vitrine datée fait douter même les meilleurs dossiers. L'inverse est aussi vrai : une présence soignée crédibilise avant la première rencontre.",
    dimension: "reputation",
    options: [
      { label: "Oui — soignée, à jour, fidèle à ce qu'on fait", value: 3 },
      { label: "Présente, mais elle mériterait une mise à jour", value: 2 },
      { label: "Quasi absente ou très datée", value: 1 },
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
      title: "Le test des 30 secondes",
      prompt:
        "Un prospect découvre votre entreprise. En 30 secondes, comprend-il ce que vous vendez, à qui, et pourquoi vous ?",
      help:
        "En B2B, la clarté du message fait gagner ou perdre le premier rendez-vous — avant même le prix.",
      dimension: "clarte",
      options: [
        { label: "Oui, c'est limpide dès la première phrase", value: 3 },
        { label: "Globalement, mais il faut souvent réexpliquer", value: 2 },
        { label: "Non — c'est souvent confus pour eux", value: 1 },
      ],
    },
    {
      id: "int-commerce-cible",
      title: "Client idéal",
      prompt:
        "Pourriez-vous décrire votre client idéal en 3 critères concrets (secteur, taille, situation) ?",
      help:
        "Un ciblage précis multiplie l'efficacité commerciale : on ne prospecte bien que ce qu'on a défini.",
      dimension: "clarte",
      options: [
        { label: "Oui — profil écrit, avec des critères", value: 3 },
        { label: "Intuitivement, sans l'avoir formalisé", value: 2 },
        { label: "Pas encore", value: 1 },
      ],
    },
  ],
  alliance: [
    {
      id: "int-alliance-quoi",
      title: "Ce que vous cherchez",
      prompt:
        "Chez un partenaire stratégique, savez-vous précisément ce que vous cherchez — et ce que vous refusez ?",
      help:
        "Les alliances qui durent partent de complémentarités nommées, pas d'affinités vagues.",
      dimension: "clarte",
      options: [
        { label: "Oui — complémentarités et limites définies", value: 3 },
        { label: "Une idée générale, à préciser", value: 2 },
        { label: "Pas encore", value: 1 },
      ],
    },
    {
      id: "int-alliance-offrir",
      title: "Ce que vous apportez",
      prompt:
        "Et dans l'autre sens : pouvez-vous formuler en une phrase ce qu'un partenaire gagne à s'allier avec vous ?",
      help:
        "Un partenaire évalue d'abord ce que vous lui apportez — savoir le dire simplement change la conversation.",
      dimension: "clarte",
      options: [
        { label: "Oui, sans hésiter", value: 3 },
        { label: "J'y arrive, avec quelques détours", value: 2 },
        { label: "Non, c'est à travailler", value: 1 },
      ],
    },
  ],
  cession: [
    {
      id: "int-cession-horizon",
      title: "Horizon de cession",
      prompt:
        "À quelle échéance envisagez-vous de céder ou transmettre ?",
      help:
        "Une cession bien préparée se joue 24 à 36 mois à l'avance — l'horizon détermine la marge de manœuvre.",
      dimension: "structure",
      options: [
        { label: "3 à 5 ans — j'ai le temps de bien préparer", value: 3 },
        { label: "1 à 2 ans — la fenêtre se rapproche", value: 2 },
        { label: "Moins d'un an — c'est urgent", value: 1 },
      ],
    },
    {
      id: "int-cession-prets",
      title: "Salle des documents",
      prompt:
        "Si un acheteur sérieux se manifestait demain, vos documents clés (états financiers, contrats, organigramme) seraient-ils prêts à montrer ?",
      help:
        "Un dossier prêt accélère la transaction et protège la valorisation — les délais font fuir les acheteurs.",
      dimension: "structure",
      options: [
        { label: "Oui — organisés et à jour", value: 3 },
        { label: "En partie — il faudrait quelques semaines", value: 2 },
        { label: "Non — tout serait à reconstituer", value: 1 },
      ],
    },
  ],
  acquisition: [
    {
      id: "int-acq-profil",
      title: "Cible d'acquisition",
      prompt:
        "L'entreprise que vous voulez acquérir : sauriez-vous la décrire en critères précis (secteur, taille, géographie) ?",
      help:
        "Des critères écrits évitent des mois perdus sur de fausses pistes — et crédibilisent votre démarche auprès des cédants.",
      dimension: "clarte",
      options: [
        { label: "Oui — critères écrits et précis", value: 3 },
        { label: "Une idée du secteur, sans plus", value: 2 },
        { label: "Pas encore", value: 1 },
      ],
    },
    {
      id: "int-acq-capacite",
      title: "Capacité de financement",
      prompt:
        "Savez-vous combien vous pouvez investir, et avec quels leviers (fonds propres, dette, partenaires) ?",
      help:
        "Un cédant sérieux demande très vite des preuves de capacité financière — mieux vaut les avoir avant de chercher.",
      dimension: "finances",
      options: [
        { label: "Oui — montants et leviers identifiés", value: 3 },
        { label: "Une enveloppe approximative", value: 2 },
        { label: "Non, c'est à explorer", value: 1 },
      ],
    },
  ],
  structuration: [
    {
      id: "int-struct-prio",
      title: "Cap des 12 mois",
      prompt:
        "Vos 3 priorités stratégiques pour les 12 prochains mois : existent-elles quelque part ailleurs que dans votre tête ?",
      help:
        "Des priorités écrites et partagées alignent l'équipe — c'est la différence entre structurer et improviser.",
      dimension: "clarte",
      options: [
        { label: "Oui — écrites et partagées avec l'équipe", value: 3 },
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
        "Aujourd'hui, qu'est-ce qui freine le plus votre entreprise ?",
      help:
        "Nommer le frein principal est le point de départ : on ne peut pas travailler ce qu'on n'a pas identifié.",
      dimension: "clarte",
      options: [
        { label: "Rien de critique — je veux juste progresser", value: 3 },
        { label: "Un point précis, que je connais", value: 2 },
        { label: "Plusieurs points, sans priorité claire", value: 1 },
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

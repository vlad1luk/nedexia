export type IntentionId =
  | "cession"
  | "acquisition"
  | "commerce"
  | "financement"
  | "structuration";

export type DimensionId =
  | "clarte"
  | "independance"
  | "finances"
  | "structure"
  | "reputation";

export type NiveauId = "fragile" | "chantier" | "solide";

export type Intention = {
  id: IntentionId;
  label: string;
  description: string;
  /** Formulation utilisée au fil des phrases : « pour {projectLabel}… » */
  projectLabel: string;
  /** Pondération des dimensions dans le score selon l’objectif. */
  poids: Record<DimensionId, number>;
  lectures: Record<NiveauId, string>;
  /** Première tâche du plan d’action, propre à l’objectif. */
  tachePremiere: { label: string; duree: string };
};

export type Dimension = {
  id: DimensionId;
  label: string;
  question: string;
  taches: { label: string; duree: string }[];
};

export type Question = {
  id: string;
  dimension: DimensionId;
  titre: string;
  /** Choix ordonnés du plus solide (3 points) au plus fragile (0 point). */
  choix: string[];
};

export type Entreprise = {
  nom: string;
  neq: string;
  site: string;
};

export type DiagnosticResult = {
  score: number;
  niveau: NiveauId;
  niveauLabel: string;
  lecture: string;
  dimensions: { id: DimensionId; score: number }[];
  planAction: { label: string; duree: string }[];
};

export const intentions: Intention[] = [
  {
    id: "cession",
    label: "Céder ou transmettre",
    description:
      "Préparer la vente de votre entreprise ou sa relève, au bon moment et à sa juste valeur.",
    projectLabel: "votre projet de cession ou de transmission",
    poids: {
      clarte: 1,
      independance: 1.6,
      finances: 1.3,
      structure: 1.4,
      reputation: 0.7,
    },
    lectures: {
      fragile:
        "En l’état, l’entreprise repose trop sur vous pour être transmise à sa juste valeur. C’est la situation la plus fréquente — et la plus payante à corriger : chaque chantier complété ajoute directement à la valeur de cession.",
      chantier:
        "Des bases existent, mais un acheteur sérieux trouverait encore trop de zones grises. En consolidant vos points faibles au cours des prochains mois, vous changez la conversation avec les repreneurs.",
      solide:
        "Votre entreprise présente déjà plusieurs attributs d’une entreprise transmissible. Le travail consiste maintenant à documenter, prouver et mettre en valeur ce qui existe pour défendre votre prix.",
    },
    tachePremiere: {
      label:
        "Noter ce que « céder » veut dire pour vous : horizon, repreneur idéal, ordre de grandeur du prix",
      duree: "20 min",
    },
  },
  {
    id: "acquisition",
    label: "Acquérir ou reprendre",
    description:
      "Reprendre une entreprise existante ou en acquérir une pour grandir plus vite.",
    projectLabel: "votre projet d’acquisition",
    poids: {
      clarte: 1.4,
      independance: 0.8,
      finances: 1.6,
      structure: 1.2,
      reputation: 1,
    },
    lectures: {
      fragile:
        "Avant de reprendre une autre entreprise, la vôtre doit pouvoir tourner sans vous accaparer. Renforcer vos bases d’abord, c’est éviter de payer votre acquisition en heures de sommeil.",
      chantier:
        "Vous avez une partie des assises nécessaires pour porter une reprise. Quelques chantiers ciblés — surtout côté finances et structure — rendront votre dossier crédible auprès des vendeurs et des prêteurs.",
      solide:
        "Vos fondations vous permettent d’aborder une acquisition en position de force. Eden peut maintenant vous aider à préparer le dossier et la recherche de cibles.",
    },
    tachePremiere: {
      label: "Définir le profil d’entreprise cible : secteur, taille, région",
      duree: "25 min",
    },
  },
  {
    id: "commerce",
    label: "Développer les ventes",
    description:
      "Trouver de nouveaux clients, ouvrir des marchés, bâtir des partenariats commerciaux.",
    projectLabel: "votre développement commercial",
    poids: {
      clarte: 1.3,
      independance: 0.9,
      finances: 1,
      structure: 0.8,
      reputation: 1.6,
    },
    lectures: {
      fragile:
        "Votre moteur commercial manque d’appuis : difficile de croître quand le cap, les chiffres ou la visibilité ne suivent pas. La bonne nouvelle : ce sont des chantiers rapides à démarrer.",
      chantier:
        "Vous avez de quoi soutenir une croissance, mais certains maillons freineraient un développement soutenu. Votre plan d’action cible d’abord ce qui bloque les ventes.",
      solide:
        "Votre entreprise est en bonne posture pour accélérer. Le travail porte maintenant sur la constance : garder les chiffres, l’équipe et la réputation au niveau pendant la croissance.",
    },
    tachePremiere: {
      label: "Lister vos trois segments de clients les plus rentables",
      duree: "20 min",
    },
  },
  {
    id: "financement",
    label: "Obtenir du financement",
    description:
      "Préparer une demande de prêt ou une ronde d’investissement qui inspire confiance.",
    projectLabel: "votre recherche de financement",
    poids: {
      clarte: 1.1,
      independance: 0.8,
      finances: 1.7,
      structure: 1.3,
      reputation: 0.9,
    },
    lectures: {
      fragile:
        "Un prêteur verrait aujourd’hui trop d’inconnues pour dire oui rapidement. Avant de déposer une demande, quelques semaines de préparation changeront radicalement la réception de votre dossier.",
      chantier:
        "Votre dossier a des forces, mais des pièces manquantes ralentiraient l’analyse. En complétant les chantiers prioritaires, vous arrivez chez le prêteur avec des réponses plutôt que des promesses.",
      solide:
        "Vous avez l’essentiel de ce qu’un prêteur veut voir. Eden peut vous aider à assembler un dossier de financement complet et à préparer les questions qui viendront.",
    },
    tachePremiere: {
      label: "Clarifier le montant recherché et à quoi il servira, poste par poste",
      duree: "25 min",
    },
  },
  {
    id: "structuration",
    label: "Structurer et y voir clair",
    description:
      "Mettre de l’ordre, solidifier les fondations et reprendre le contrôle de votre temps.",
    projectLabel: "votre chantier de structuration",
    poids: {
      clarte: 1.2,
      independance: 1,
      finances: 1,
      structure: 1.2,
      reputation: 1,
    },
    lectures: {
      fragile:
        "Beaucoup passe encore par vous et peu est écrit — c’est exactement le point de départ pour lequel Eden est fait. On avance une tâche de 15 à 30 minutes à la fois, sans chambouler vos journées.",
      chantier:
        "L’entreprise tient, mais elle vous coûte encore trop d’énergie. Les chantiers prioritaires de votre plan visent à libérer du temps et à sécuriser ce qui existe déjà.",
      solide:
        "Vos fondations sont saines. La structuration devient un travail d’entretien et d’optimisation — et ouvre la porte aux projets plus ambitieux : croissance, financement, alliances.",
    },
    tachePremiere: {
      label: "Choisir le chantier qui vous pèse le plus au quotidien",
      duree: "15 min",
    },
  },
];

export const dimensions: Dimension[] = [
  {
    id: "clarte",
    label: "Clarté",
    question: "Votre cap est-il défini et partagé?",
    taches: [
      { label: "Écrire en cinq lignes où sera l’entreprise dans trois ans", duree: "20 min" },
      { label: "Formuler en une phrase ce qui vous distingue", duree: "15 min" },
      { label: "Lister vos trois priorités des douze prochains mois", duree: "15 min" },
    ],
  },
  {
    id: "independance",
    label: "Indépendance",
    question: "L’entreprise tient-elle sans vous?",
    taches: [
      { label: "Lister tout ce qui ne peut pas se faire sans vous", duree: "20 min" },
      { label: "Documenter votre processus le plus critique", duree: "30 min" },
      { label: "Identifier un relai pour vos deux clients clés", duree: "20 min" },
    ],
  },
  {
    id: "finances",
    label: "Finances",
    question: "Vos chiffres sont-ils à jour et maîtrisés?",
    taches: [
      { label: "Rassembler vos deux derniers états financiers", duree: "20 min" },
      { label: "Faire le point sur le retard de tenue de livres", duree: "15 min" },
      { label: "Calculer la marge de votre produit ou service principal", duree: "30 min" },
    ],
  },
  {
    id: "structure",
    label: "Structure",
    question: "Vos fondations légales et organisationnelles tiennent-elles?",
    taches: [
      { label: "Localiser votre livre de minutes et noter son état", duree: "15 min" },
      { label: "Lister les ententes verbales à formaliser", duree: "20 min" },
      { label: "Écrire qui décide quoi dans l’équipe", duree: "20 min" },
    ],
  },
  {
    id: "reputation",
    label: "Réputation",
    question: "Que voient vos clients et vos partenaires?",
    taches: [
      { label: "Mettre à jour votre fiche Google Entreprise", duree: "25 min" },
      { label: "Demander un avis à trois bons clients", duree: "15 min" },
      { label: "Vérifier ce qu’un inconnu trouve en vous googlant", duree: "15 min" },
    ],
  },
];

export const questions: Question[] = [
  // ── Clarté ────────────────────────────────────────────────
  {
    id: "clarte-1",
    dimension: "clarte",
    titre: "Où voyez-vous votre entreprise dans trois ans?",
    choix: [
      "C’est écrit, chiffré, et mon équipe le connaît",
      "C’est clair dans ma tête, mais nulle part ailleurs",
      "J’ai une idée générale, sans plus",
      "Je navigue une année à la fois",
    ],
  },
  {
    id: "clarte-2",
    dimension: "clarte",
    titre: "L’objectif qui vous amène ici a-t-il une échéance réaliste?",
    choix: [
      "Oui, avec des étapes déjà identifiées",
      "Une échéance, mais pas encore d’étapes",
      "Un horizon vague — « d’ici quelques années »",
      "Aucune, je commence à y réfléchir",
    ],
  },
  {
    id: "clarte-3",
    dimension: "clarte",
    titre: "Ce qui distingue votre entreprise de ses concurrents…",
    choix: [
      "Je peux l’expliquer en une phrase, preuves à l’appui",
      "Je le sais, mais j’ai du mal à le formuler",
      "C’est flou — on fait comme les autres, en mieux",
      "Je ne me suis jamais vraiment posé la question",
    ],
  },
  // ── Indépendance ──────────────────────────────────────────
  {
    id: "independance-1",
    dimension: "independance",
    titre: "Si vous partiez quatre semaines sans téléphone, l’entreprise…",
    choix: [
      "Tournerait normalement",
      "Tiendrait, avec quelques ratés",
      "Survivrait en mode urgence",
      "S’arrêterait — tout passe par moi",
    ],
  },
  {
    id: "independance-2",
    dimension: "independance",
    titre: "Les relations avec vos clients importants…",
    choix: [
      "Sont partagées entre plusieurs personnes de l’équipe",
      "Passent surtout par moi, mais l’équipe est connue des clients",
      "Reposent presque entièrement sur moi",
      "Sont toutes dans ma tête et mon cellulaire",
    ],
  },
  {
    id: "independance-3",
    dimension: "independance",
    titre:
      "Vos façons de faire essentielles — production, livraison, soumissions…",
    choix: [
      "Sont documentées et suivies",
      "Sont partiellement écrites",
      "Se transmettent de bouche à oreille",
      "Chacun fait à sa manière",
    ],
  },
  // ── Finances ──────────────────────────────────────────────
  {
    id: "finances-1",
    dimension: "finances",
    titre: "Vos états financiers les plus récents…",
    choix: [
      "Datent de moins de trois mois",
      "Datent de la dernière fin d’année",
      "Ont plus d’un an",
      "Je ne saurais pas les retrouver rapidement",
    ],
  },
  {
    id: "finances-2",
    dimension: "finances",
    titre: "Votre comptabilité au quotidien…",
    choix: [
      "Est tenue à jour chaque semaine",
      "Est rattrapée chaque mois ou chaque trimestre",
      "Est remise au CPA en bloc à la fin de l’année",
      "Accumule du retard",
    ],
  },
  {
    id: "finances-3",
    dimension: "finances",
    titre: "Votre marge par produit ou par service…",
    choix: [
      "Je la connais et je la suis",
      "Je la connais approximativement",
      "Je connais seulement la marge globale",
      "Je ne la calcule pas",
    ],
  },
  // ── Structure ─────────────────────────────────────────────
  {
    id: "structure-1",
    dimension: "structure",
    titre: "Votre livre de minutes et vos registres corporatifs…",
    choix: [
      "Sont à jour, chez nous ou chez notre avocat",
      "Existent, avec quelques retards",
      "N’ont pas été touchés depuis des années",
      "Je ne sais pas où ils sont",
    ],
  },
  {
    id: "structure-2",
    dimension: "structure",
    titre: "Les contrats importants — clients, fournisseurs, employés clés…",
    choix: [
      "Sont écrits, signés et à jour",
      "Sont écrits pour la plupart",
      "Sont surtout des ententes verbales",
      "Rien n’est formalisé",
    ],
  },
  {
    id: "structure-3",
    dimension: "structure",
    titre: "Les rôles et responsabilités dans votre équipe…",
    choix: [
      "Sont définis et connus de tous",
      "Sont clairs pour les postes clés",
      "Sont flous — tout le monde fait un peu de tout",
      "Il n’y a pas vraiment d’équipe : tout repose sur moi",
    ],
  },
  // ── Réputation ────────────────────────────────────────────
  {
    id: "reputation-1",
    dimension: "reputation",
    titre: "Votre présence en ligne — site, fiche Google, réseaux…",
    choix: [
      "Reflète fidèlement l’entreprise d’aujourd’hui",
      "Existe, mais mérite une mise à jour",
      "Est minimale ou dépassée",
      "Est à peu près inexistante",
    ],
  },
  {
    id: "reputation-2",
    dimension: "reputation",
    titre: "Les avis et références de vos clients…",
    choix: [
      "Sont nombreux, récents, et je les mets de l’avant",
      "Existent, mais je ne les exploite pas",
      "Sont rares — je n’en demande jamais",
      "Je ne sais pas ce qui se dit sur nous",
    ],
  },
  {
    id: "reputation-3",
    dimension: "reputation",
    titre: "Si un banquier ou un acheteur sérieux vous googlait demain…",
    choix: [
      "Il trouverait une entreprise crédible et cohérente",
      "Il trouverait l’essentiel, sans plus",
      "Il trouverait peu de choses",
      "Ça pourrait jouer contre nous",
    ],
  },
];

/** Points d’un choix : l’index 0 est le plus solide (3), l’index 3 le plus fragile (0). */
export const pointsParChoix = (choixIndex: number) => 3 - choixIndex;

export const POINTS_MAX_PAR_QUESTION = 3;

const niveauLabels: Record<NiveauId, string> = {
  fragile: "À défricher",
  chantier: "En croissance",
  solide: "Bien enraciné",
};

export function getIntention(id: IntentionId): Intention {
  return intentions.find((i) => i.id === id) ?? intentions[4];
}

export function getDimension(id: DimensionId): Dimension {
  return dimensions.find((d) => d.id === id) ?? dimensions[0];
}

export function computeResult(
  intentionId: IntentionId,
  answers: Record<string, number>,
): DiagnosticResult {
  const intention = getIntention(intentionId);

  const dimensionScores = dimensions.map((dimension) => {
    const dimQuestions = questions.filter((q) => q.dimension === dimension.id);
    const points = dimQuestions.reduce(
      (sum, q) => sum + pointsParChoix(answers[q.id] ?? 3),
      0,
    );
    const max = dimQuestions.length * POINTS_MAX_PAR_QUESTION;
    return { id: dimension.id, score: Math.round((points / max) * 100) };
  });

  const poidsTotal = dimensionScores.reduce(
    (sum, d) => sum + intention.poids[d.id],
    0,
  );
  const score = Math.round(
    dimensionScores.reduce(
      (sum, d) => sum + d.score * intention.poids[d.id],
      0,
    ) / poidsTotal,
  );

  const niveau: NiveauId =
    score >= 70 ? "solide" : score >= 45 ? "chantier" : "fragile";

  // Plan d’action initial : la tâche propre à l’objectif, puis les chantiers
  // des deux dimensions les plus faibles (pondérées selon l’objectif).
  const parPriorite = [...dimensionScores].sort(
    (a, b) =>
      a.score / intention.poids[a.id] - b.score / intention.poids[b.id],
  );
  const planAction = [
    intention.tachePremiere,
    ...getDimension(parPriorite[0].id).taches.slice(0, 2),
    getDimension(parPriorite[1].id).taches[0],
  ];

  return {
    score,
    niveau,
    niveauLabel: niveauLabels[niveau],
    lecture: intention.lectures[niveau],
    dimensions: dimensionScores,
    planAction,
  };
}

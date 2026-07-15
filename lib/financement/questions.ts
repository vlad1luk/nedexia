/**
 * Diagnostic financement — catalogue de questions.
 *
 * ⚠️ CONTENU PLACEHOLDER : les questions ci-dessous sont une première
 * ébauche réaliste pour développer et tester le tunnel. Le contenu final
 * (5 à 8 questions) sera fourni par l'équipe — il suffit de remplacer les
 * entrées de `FINANCEMENT_QUESTIONS`, le tunnel s'adapte automatiquement.
 *
 * Structure volontairement générique :
 * - `value` est un identifiant libre (string), pas une note — le verdict
 *   (voir `verdict.ts`) décide quoi en faire.
 * - `help` est le texte facultatif affiché sous la question (la « voix »
 *   d'Eden qui explique pourquoi on demande).
 */

export type FinancementOption = {
  value: string;
  label: string;
};

export type FinancementQuestion = {
  id: string;
  /** Petit titre court affiché au-dessus de la question (catégorie). */
  title: string;
  prompt: string;
  /** Pourquoi on pose la question — donne du sens, réduit la friction. */
  help?: string;
  options: FinancementOption[];
};

export type FinancementAnswers = Record<string, string>;

export const FINANCEMENT_QUESTIONS: FinancementQuestion[] = [
  {
    id: "secteur",
    title: "Secteur d'activité",
    prompt: "Dans quel secteur votre entreprise opère-t-elle ?",
    help:
      "Plusieurs programmes sont réservés à des secteurs précis — c'est le premier filtre d'admissibilité.",
    options: [
      { value: "manufacturier", label: "Manufacturier / production" },
      { value: "techno", label: "Technologies / numérique" },
      { value: "services", label: "Services professionnels" },
      { value: "autre", label: "Commerce, agroalimentaire ou autre" },
    ],
  },
  {
    id: "taille",
    title: "Taille de l'équipe",
    prompt: "Combien de personnes travaillent dans votre entreprise ?",
    help:
      "Le nombre d'employés ouvre (ou ferme) des programmes — notamment ceux liés à l'embauche et à la formation.",
    options: [
      { value: "solo", label: "Je suis seul·e (ou avec un associé)" },
      { value: "2-10", label: "2 à 10 personnes" },
      { value: "11-50", label: "11 à 50 personnes" },
      { value: "50+", label: "Plus de 50 personnes" },
    ],
  },
  {
    id: "revenus",
    title: "Chiffre d'affaires",
    prompt: "Où se situe votre chiffre d'affaires annuel ?",
    help:
      "Un ordre de grandeur suffit — certains programmes exigent des ventes, d'autres financent justement les entreprises pré-revenus.",
    options: [
      { value: "pre-revenus", label: "Pas encore de ventes" },
      { value: "<500k", label: "Moins de 500 000 $" },
      { value: "500k-2m", label: "Entre 500 000 $ et 2 M$" },
      { value: "2m+", label: "Plus de 2 M$" },
    ],
  },
  {
    id: "projet",
    title: "Votre projet",
    prompt: "Quel projet aimeriez-vous faire financer en priorité ?",
    help:
      "C'est la question centrale : le financement suit le projet, jamais l'inverse.",
    options: [
      { value: "rd", label: "Développer ou améliorer un produit (R&D, innovation)" },
      { value: "equipement", label: "Moderniser mes équipements ou ma production" },
      { value: "marches", label: "Développer de nouveaux marchés ou exporter" },
      { value: "equipe", label: "Embaucher ou former mon équipe" },
    ],
  },
  {
    id: "investissement",
    title: "Ampleur du projet",
    prompt: "Quel budget total représente ce projet, environ ?",
    help:
      "La fourchette détermine les programmes pertinents — et la portion que vous devrez assumer vous-même.",
    options: [
      { value: "<25k", label: "Moins de 25 000 $" },
      { value: "25-100k", label: "25 000 $ à 100 000 $" },
      { value: "100-500k", label: "100 000 $ à 500 000 $" },
      { value: "500k+", label: "Plus de 500 000 $" },
    ],
  },
  {
    id: "horizon",
    title: "Horizon",
    prompt: "Quand aimeriez-vous lancer ce projet ?",
    help:
      "Certains programmes ont des dates de dépôt fixes — l'horizon décide de la stratégie de dossier.",
    options: [
      { value: "0-3mois", label: "C'est déjà en cours ou imminent" },
      { value: "3-12mois", label: "D'ici 3 à 12 mois" },
      { value: "exploration", label: "J'explore, pas de date arrêtée" },
    ],
  },
];

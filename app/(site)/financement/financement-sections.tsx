import Reveal from "../components/reveal";
import { StartDiagnosticButton } from "./start-diagnostic-button";

/**
 * Sections de conversion de /financement — carnet de terrain / grand livre.
 * Composants serveur (sauf Reveal / le CTA, clients), contenu statique.
 * Aucune grille icône-rond, aucune carte de verre : filets d'encre,
 * numérotation en Fraunces italique, fiches spécimen légèrement inclinées.
 */

// ─────────────── Ce que vous recevez — lignes de registre ───────────────

const LIVRABLES = [
  {
    titre: "Vos programmes admissibles",
    texte:
      "Pas la liste complète — les programmes où votre profil et vos projets ont de réelles chances.",
  },
  {
    titre: "La portion finançable",
    texte:
      "Quelle partie de votre projet peut être couverte, et à quelle hauteur.",
  },
  {
    titre: "Le montant estimé",
    texte:
      "Une fourchette chiffrée, fondée sur les règles réelles des programmes.",
  },
  {
    titre: "Votre prochaine étape",
    texte:
      "Ce qu'il faut préparer, dans quel ordre — et comment Eden vous accompagne jusqu'au dépôt.",
  },
] as const;

export function CeQueVousRecevez() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Ce que vous recevez
          </span>
          <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
            Un verdict, pas une liste.
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col border-t border-ink/15">
          {LIVRABLES.map((item, i) => (
            <Reveal key={item.titre} delay={0.06 * i}>
              <article className="flex flex-col gap-2 border-b border-ink/15 py-6 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="shrink-0 font-[family-name:var(--font-fraunces)] text-lg italic text-brass sm:w-10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="shrink-0 text-base font-semibold text-ink sm:w-64">
                  {item.titre}
                </h3>
                <span className="hidden flex-1 border-b border-dotted border-ink/25 sm:block" />
                <p className="text-sm leading-relaxed text-ink-soft sm:max-w-xs sm:text-right">
                  {item.texte}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────── La méthode derrière le verdict — marginalia ───────────────

export function LaMethode() {
  return (
    <section className="bg-ink py-20 text-parchment sm:py-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <Reveal>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            La méthode derrière le verdict
          </span>
          {/* TODO : le taux de 97 % est une donnée réelle à confirmer avant
              mise en ligne. */}
          <h2 className="mt-3 text-balance font-[family-name:var(--font-fraunces)] text-2xl font-medium leading-snug sm:text-[1.85rem]">
            Ce diagnostic encode 10 ans d&rsquo;accompagnement terrain et un
            taux d&rsquo;obtention de 97 % sur les dossiers déposés.
          </h2>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-parchment/70">
            La règle qui explique ce taux :{" "}
            <strong className="font-semibold text-parchment">
              projet d&rsquo;abord, financement ensuite
            </strong>
            . Un projet réel se défend tout seul dans un dossier ; un projet
            inventé pour une subvention, ça se voit, et ça échoue.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <figure className="border-l-2 border-brass/50 pl-6">
            <blockquote className="text-balance font-[family-name:var(--font-fraunces)] text-xl italic leading-relaxed text-parchment/95">
              Ce n&rsquo;est pas l&rsquo;argent qui fait le projet — c&rsquo;est
              le projet qui fait l&rsquo;argent. Si vous et votre projet avez
              de la valeur, et que vous avez les bons outils et les bons mots
              pour les présenter, vous avez toutes les chances d&rsquo;être
              soutenu — pour que vos projets se réalisent.
            </blockquote>
            <figcaption className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-brass">
              Jérôme Reynaud, fondateur
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────── Cas réels — fiches spécimen ───────────────

/* TODO : les deux cas ci-dessous sont des données réelles à confirmer
   (montants, programmes) avant mise en ligne — ne pas modifier les chiffres
   sans validation. */
const CAS_REELS = [
  {
    titre: "Projet de développement R&D",
    de: "10 000 $ investis",
    vers: "100 000 $ de projet financé",
    detail: "Programme à 90 % de couverture.",
    rotate: "-rotate-[1.1deg]",
  },
  {
    titre: "PME sans vente, produit à moderniser",
    de: "46 000 $ obtenus (CNRC)",
    vers: "50 000 $+ en cours (PARI-CNRC)",
    detail: "La preuve qu'on peut être financé avant même les premières ventes.",
    rotate: "rotate-[0.9deg]",
  },
] as const;

export function CasReels() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Preuves de terrain
          </span>
          <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
            Des dossiers réels, des montants réels.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8">
          {CAS_REELS.map((cas, i) => (
            <Reveal key={cas.titre} delay={0.1 * i}>
              <article
                className={`relative border border-ink/15 bg-parchment-deep/60 p-6 shadow-[3px_4px_0_0_rgba(27,36,48,0.08)] ${cas.rotate}`}
              >
                <span className="absolute -top-3 -right-3 grid h-14 w-14 rotate-12 place-items-center rounded-full border-2 border-rust/70 text-center text-[0.55rem] font-bold uppercase leading-tight tracking-[0.06em] text-rust">
                  Dossier
                  <br />
                  réel
                </span>
                <h3 className="pr-10 text-base font-semibold text-ink">
                  {cas.titre}
                </h3>
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-sm text-ink-soft">{cas.de}</span>
                  <span className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-moss">
                    → {cas.vers}
                  </span>
                </div>
                <p className="mt-4 text-sm text-ink-soft">{cas.detail}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────── FAQ — registre ───────────────

const FAQ = [
  {
    q: "Est-ce vraiment gratuit ?",
    r: "Oui. Le diagnostic est gratuit et sans engagement. Nedexia est financée par l'écosystème qui sert les PME — jamais par les PME elles-mêmes.",
  },
  {
    q: "En quoi est-ce différent d'un moteur de recherche de subventions ?",
    r: "Un moteur donne une liste théorique. Nous donnons un verdict — ce que votre entreprise peut réellement obtenir — puis un accompagnement jusqu'au dépôt. La différence, c'est l'obtention.",
  },
  {
    q: "Que se passe-t-il après le diagnostic ?",
    r: "Eden, le tuteur de croissance, vous propose un plan : préparer le dossier prioritaire, structurer ce qui doit l'être, avancer étape par étape. Vous gardez le contrôle à chaque moment.",
  },
] as const;

export function FaqFinancement() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Reveal>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Questions fréquentes
          </span>
        </Reveal>

        <div className="mt-6 flex flex-col border-t border-ink/15">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={0.05 * i}>
              <details className="group border-b border-ink/15 py-4">
                <summary className="flex cursor-pointer list-none items-center gap-4 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[0.98rem] font-medium text-ink">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="text-lg font-light text-ink-soft transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 pl-8 text-sm leading-relaxed text-ink-soft">
                  {item.r}
                </p>
              </details>
            </Reveal>
          ))}
        </div>

        {/* Dernière relance avant le footer. */}
        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-col items-center gap-4 border-t border-ink/15 pt-12 text-center">
            <p className="text-balance font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink">
              10 minutes. Sans compte. Votre verdict vous attend.
            </p>
            <StartDiagnosticButton>Commencer mon diagnostic</StartDiagnosticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

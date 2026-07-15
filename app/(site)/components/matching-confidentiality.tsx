"use client";

import Reveal from "./reveal";

/**
 * Élément signature de /matching — le dossier à trois tampons.
 *
 * Ni grille icône-rond, ni cartes pastel : une révélation progressive
 * présentée comme un dossier classifié. Chaque niveau = un cachet
 * (Anonyme → Qualifié → Confidentiel), avec ce qui est visible / masqué
 * en lignes de registre. Contenu fidèle à la spécification produit.
 */

const LEVELS = [
  {
    level: "01",
    name: "Anonyme",
    visibility: "Dès la création du profil",
    stamp: "ANONYME",
    shared: [
      "Secteur d’activité",
      "Région",
      "Taille approximative",
      "Intention déclarée",
    ],
    notShared: ["Aucun nom", "Aucun logo", "Aucune donnée identifiable"],
  },
  {
    level: "02",
    name: "Qualifié",
    visibility: "Après match mutuel confirmé",
    stamp: "QUALIFIÉ",
    shared: [
      "Nom de l’entreprise",
      "Description générale",
      "Critères affinés",
    ],
    notShared: [
      "Données financières",
      "Historique transactionnel",
      "Contacts directs",
    ],
  },
  {
    level: "03",
    name: "Confidentiel partagé",
    visibility: "Après signature du NDA intégré",
    stamp: "CONFIDENTIEL",
    shared: [
      "Données complètes",
      "Documents, CA et historique",
      "Contact direct",
    ],
    notShared: ["Rien — les deux parties ont signé l’accord"],
  },
] as const;

const CONTROLS = [
  "Choix du niveau de visibilité",
  "Blocage d’entreprises ou de concurrents directs",
  "Restriction par type d’acquéreur ou de partenaire",
  "Validation avant révélation d’informations sensibles",
  "Traçabilité des interactions importantes",
  "Nedexia reconnue comme source de la connexion qualifiée",
];

function Stamp({ label, tone }: { label: string; tone: "soft" | "brass" | "rust" }) {
  const colors = {
    soft: "border-ink/30 text-ink/45",
    brass: "border-brass/70 text-brass",
    rust: "border-rust/80 text-rust",
  } as const;

  return (
    <span
      aria-hidden
      className={`inline-grid h-16 w-16 rotate-12 place-items-center rounded-full border-2 text-center text-[0.5rem] font-bold uppercase leading-tight tracking-[0.04em] sm:h-[4.5rem] sm:w-[4.5rem] sm:text-[0.55rem] ${colors[tone]}`}
    >
      {label}
    </span>
  );
}

export default function MatchingConfidentiality() {
  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Confidentialité Nedexia
          </span>
          <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
            Une révélation progressive en trois niveaux.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Vous contrôlez ce que vous révélez, à qui, et à quel moment — le
            frein n°1 des cédants, résolu par construction plutôt que par une
            promesse.
          </p>
        </Reveal>

        {/* Dossier : niveaux empilés avec cachets */}
        <div className="mt-12 flex flex-col border border-ink/15 bg-parchment shadow-[3px_4px_0_0_rgba(27,36,48,0.08)]">
          {LEVELS.map((level, i) => {
            const stampTone =
              i === 0 ? "soft" : i === 1 ? "brass" : ("rust" as const);
            return (
              <Reveal key={level.level} delay={0.06 * i}>
                <article
                  className={`relative border-b border-ink/15 p-6 last:border-b-0 sm:p-8 ${
                    i === 2 ? "bg-parchment-deep/50" : ""
                  }`}
                >
                  <div className="absolute -right-1 -top-1 sm:right-4 sm:top-4">
                    <Stamp label={level.stamp} tone={stampTone} />
                  </div>

                  <div className="flex items-baseline gap-3 pr-16 sm:pr-24">
                    <span className="font-[family-name:var(--font-fraunces)] text-lg italic text-brass">
                      {level.level}
                    </span>
                    <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink">
                      {level.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    {level.visibility}
                  </p>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-moss">
                        Informations visibles
                      </p>
                      <ul className="mt-2 flex flex-col">
                        {level.shared.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 border-b border-dotted border-ink/15 py-2 text-sm text-ink last:border-b-0"
                          >
                            <span
                              aria-hidden
                              className="font-[family-name:var(--font-fraunces)] text-xs italic text-moss"
                            >
                              ✓
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                        Non partagées
                      </p>
                      <ul className="mt-2 flex flex-col">
                        {level.notShared.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 border-b border-dotted border-ink/15 py-2 text-sm text-ink-soft last:border-b-0"
                          >
                            <span
                              aria-hidden
                              className="font-[family-name:var(--font-fraunces)] text-xs italic text-rust/70"
                            >
                              —
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* NDA + contrôles — deux colonnes de registre, pas des cartes icône */}
        <div className="mt-10 grid grid-cols-1 border border-ink/15 sm:grid-cols-2">
          <Reveal delay={0.08}>
            <div className="border-b border-ink/15 p-6 sm:border-b-0 sm:border-r sm:p-7">
              <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                NDA
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-lg font-medium text-ink">
                NDA intégré
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Avant toute transmission d’information sensible, Nedexia peut
                proposer un NDA électronique standardisé, adapté au contexte
                québécois — signature électronique, juridiction CCQ. Il
                s’active au passage vers le niveau 03.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Le but : réduire la friction, accélérer les échanges et
                protéger les deux parties.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="bg-parchment-deep/40 p-6 sm:p-7">
              <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                Contrôle
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-lg font-medium text-ink">
                Contrôle du dirigeant
              </h3>
              <ul className="mt-4 flex flex-col">
                {CONTROLS.map((item) => (
                  <li
                    key={item}
                    className="border-b border-dotted border-ink/20 py-2.5 text-sm leading-snug text-ink last:border-b-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-xs uppercase tracking-[0.14em] text-ink-soft">
            <span>Hébergé au Canada</span>
            <span aria-hidden className="text-ink/25">
              ·
            </span>
            <span>Conforme à la Loi 25</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import Reveal from "./reveal";

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c5 0 9 3.5 10 7-.4 1.2-1 2.4-1.9 3.4M6.2 6.6C4.1 8 2.6 10 2 12c1 3.5 5 7 10 7 1.3 0 2.6-.2 3.7-.7" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12c1-3.5 5-7 10-7s9 3.5 10 7c-1 3.5-5 7-10 7s-9-3.5-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function DashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
      <path d="M5 12h14" />
    </svg>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z" />
      <path d="M9.2 12.2l2 2 3.6-4" />
    </svg>
  );
}

const LEVELS = [
  {
    level: "Niveau 01",
    name: "Anonyme",
    visibility: "Dès la création du profil",
    shared: ["Secteur d’activité", "Région", "Taille approximative", "Intention déclarée"],
    notShared: ["Aucun nom", "Aucun logo", "Aucune donnée identifiable"],
    Icon: EyeOffIcon,
    tone: "muted" as const,
  },
  {
    level: "Niveau 02",
    name: "Qualifié",
    visibility: "Après match mutuel confirmé",
    shared: ["Nom de l’entreprise", "Description générale", "Critères affinés"],
    notShared: ["Données financières", "Historique transactionnel", "Contacts directs"],
    Icon: EyeIcon,
    tone: "teal" as const,
  },
  {
    level: "Niveau 03",
    name: "Confidentiel partagé",
    visibility: "Après signature du NDA intégré",
    shared: ["Données complètes", "Documents, CA et historique", "Contact direct"],
    notShared: ["Rien — les deux parties ont signé l’accord"],
    Icon: LockIcon,
    tone: "leaf" as const,
  },
] as const;

const TONE: Record<
  (typeof LEVELS)[number]["tone"],
  { border: string; bg: string; tile: string; label: string }
> = {
  muted: {
    border: "border-navy/10",
    bg: "bg-background",
    tile: "bg-navy/8 text-navy/70",
    label: "text-foreground/45",
  },
  teal: {
    border: "border-teal/30",
    bg: "bg-teal/5",
    tile: "bg-teal/15 text-teal",
    label: "text-teal",
  },
  leaf: {
    border: "border-leaf/40",
    bg: "bg-leaf/5",
    tile: "bg-leaf/15 text-leaf-deep",
    label: "text-leaf-deep",
  },
};

const CONTROLS = [
  "Choix du niveau de visibilité",
  "Blocage d’entreprises ou de concurrents directs",
  "Restriction par type d’acquéreur ou de partenaire",
  "Validation avant révélation d’informations sensibles",
  "Traçabilité des interactions importantes",
  "Nedexia reconnue comme source de la connexion qualifiée",
];

/**
 * Confidentialité 3 niveaux + NDA intégré — le frein n°1 des cédants,
 * rendu visible directement sur Matching plutôt que relégué à une page
 * légale. Contenu fidèle à la spécification produit, sans invention.
 */
export default function MatchingConfidentiality() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal">
              Confidentialité Nedexia
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Une révélation progressive en trois niveaux.
            </h2>
            <p className="mt-4 text-lg text-foreground/70">
              Vous contrôlez ce que vous révélez, à qui, et à quel moment —
              le frein n°1 des cédants, résolu par construction plutôt que
              par une promesse.
            </p>
          </div>
        </Reveal>

        {/* Les 3 niveaux */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {LEVELS.map((level, i) => {
            const tone = TONE[level.tone];
            return (
              <Reveal key={level.level} delay={i * 0.08}>
                <article className={`flex h-full flex-col rounded-3xl border ${tone.border} ${tone.bg} p-7`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone.tile}`}>
                      <level.Icon className="h-5 w-5" />
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${tone.label}`}>
                      {level.level}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-navy">{level.name}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-foreground/45">
                    {level.visibility}
                  </p>

                  <div className="mt-5 border-t border-navy/8 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                      Informations visibles
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {level.shared.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm leading-snug text-foreground/75">
                          <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf-deep" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 border-t border-navy/8 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                      Non partagées
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {level.notShared.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm leading-snug text-foreground/55">
                          <DashIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/30" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* NDA intégré */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-3xl border border-navy/10 bg-background p-7 sm:p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-navy/8 text-navy">
                <LockIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-navy">NDA intégré</h3>
              <p className="mt-2 leading-relaxed text-foreground/70">
                Avant toute transmission d’information sensible, Nedexia peut
                proposer un NDA électronique standardisé, adapté au contexte
                québécois — signature électronique, juridiction CCQ. Il
                s’active au passage vers le niveau 03.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                Le but : réduire la friction, accélérer les échanges et
                protéger les deux parties.
              </p>
            </div>
          </Reveal>

          {/* Contrôles */}
          <Reveal delay={0.16}>
            <div className="flex h-full flex-col rounded-3xl border border-navy/10 bg-background p-7 sm:p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-navy/8 text-navy">
                <BadgeIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-navy">Contrôle du dirigeant</h3>
              <ul className="mt-3 space-y-2">
                {CONTROLS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/75">
                    <BadgeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Confiance — bande courte, pas un mur juridique */}
        <Reveal delay={0.2}>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-sm text-foreground/50">
            <span>Hébergé au Canada</span>
            <span aria-hidden className="text-navy/20">·</span>
            <span>Conforme à la Loi 25</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

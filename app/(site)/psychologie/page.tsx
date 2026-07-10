import type { Metadata } from "next";
import Link from "next/link";
import PsychologyHero from "../components/psychology-hero";
import PsychologyReportPreview from "../components/psychology-report-preview";
import Reveal from "../components/reveal";
import ScrollFillText from "../components/scroll-fill-text";
import { InfinityIcon, LeafShape } from "../components/icons";

export const metadata: Metadata = {
  title: "Psychologie d’entreprise — Nedexia",
  description:
    "Pourquoi le score de compatibilité Nedexia intègre une couche psychologique — et comment elle s’inscrit dans le matching, sans jamais devenir un filtre d’exclusion.",
};

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 3.5a3 3 0 0 0-3 3v.3A3.2 3.2 0 0 0 4.5 9.8a3.3 3.3 0 0 0 .6 4A3.2 3.2 0 0 0 6 17.5a3 3 0 0 0 3 3" />
      <path d="M14.5 3.5a3 3 0 0 1 3 3v.3a3.2 3.2 0 0 1 2 2.9 3.24 3.24 0 0 1-.6 4 3.2 3.2 0 0 1-.9 3.7 3 3 0 0 1-3 3" />
      <path d="M9.5 3.5v17M14.5 3.5v17" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 12a7 7 0 0 1-7 7H7l-3 3v-4.2A7 7 0 0 1 6 5.4 7 7 0 0 1 20 12Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3.5 5 6v6c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6l-7-2.5Z" />
      <path d="M9.2 12.2l2 2 3.6-4" />
    </svg>
  );
}

const LAYERS = [
  {
    num: "01",
    title: "Big Five (OCEAN)",
    tag: "Base scientifique",
    body: "Le modèle de personnalité le plus validé en psychologie — cinq traits qui prédisent durablement le comportement.",
    icon: BrainIcon,
  },
  {
    num: "02",
    title: "16 Personalities",
    tag: "Langage commun",
    body: "Un vocabulaire que les dirigeants connaissent déjà, pour rendre le profil lisible et actionnable des deux côtés.",
    icon: ChatIcon,
  },
  {
    num: "03",
    title: "3 dimensions relationnelles",
    tag: "Propriétaires Nedexia",
    body: "Les critères spécifiques aux transactions d’affaires — construits pour prédire ce qui fait échouer une alliance.",
    icon: InfinityIcon,
  },
];

const DIMENSIONS = [
  {
    num: "01",
    title: "Style post-acquisition",
    body: "Durée de présence souhaitée, vitesse de transition, tolérance à l’ambiguïté.",
    icon: ClockIcon,
  },
  {
    num: "02",
    title: "Héritage et changement",
    body: "Attachement au nom, aux équipes, à la culture — et ce qu’on est prêt à en faire évoluer.",
    icon: CompassIcon,
  },
  {
    num: "03",
    title: "Communication & décision",
    body: "Style direct ou diplomatique, analytique ou intuitif, tolérance au risque.",
    icon: MessageIcon,
  },
];

export default function PsychologiePage() {
  return (
    <>
      <PsychologyHero />

      {/* ── Pourquoi ça compte ──────────────────────────────── */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <Reveal>
              <div className="rounded-[2rem] border-2 border-leaf/40 bg-gradient-to-br from-leaf/5 to-teal/5 p-8 text-center sm:p-10">
                <p className="font-eden text-6xl font-semibold leading-none tracking-tight text-navy sm:text-7xl">
                  ~50&nbsp;%
                </p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/65">
                  des acquisitions PME connaissent des difficultés dans les 3
                  ans suivant le closing — pour des raisons de culture, de
                  style de direction ou d’incompatibilité de vision.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal">
                Pourquoi ça compte
              </p>
              <ScrollFillText
                className="mt-4"
                text="Une transmission échoue rarement sur les chiffres. Elle échoue sur la relation."
                accents={["chiffres.", "relation."]}
              />
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
                Nedexia est la seule application de matchmaking B2B à
                intégrer une couche psychologique dans son score de
                compatibilité — parce que la compatibilité humaine, en
                démarche solo, n’est à peu près jamais évaluée avant qu’il ne
                soit trop tard.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Les 3 couches ───────────────────────────────────── */}
      <section className="bg-background py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-teal">
                Le profil psychologique
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Trois couches, une seule lecture
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Chaque couche s’appuie sur la précédente — de la base
                scientifique jusqu’aux critères propres aux transactions
                d’affaires.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3 md:items-stretch">
            {LAYERS.map((layer, i) => (
              <Reveal key={layer.title} delay={i * 0.08} className="relative">
                <div className="flex h-full flex-col rounded-3xl border border-navy/10 bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/35">
                      {layer.num}
                    </span>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                      <layer.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-leaf-deep">
                    {layer.tag}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-navy">{layer.title}</h3>
                  <p className="mt-3 leading-relaxed text-foreground/70">{layer.body}</p>
                </div>
                {i < LAYERS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-[1.1rem] top-1/2 z-10 hidden -translate-y-1/2 text-2xl font-bold text-navy/20 md:block"
                  >
                    +
                  </span>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Les 3 dimensions exclusives ─────────────────────── */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-teal">
                Différenciateur unique Nedexia
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Les 3 dimensions exclusives
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Là où les autres outils de matchmaking s’arrêtent — ce que
                mesure réellement la couche propriétaire de Nedexia.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {DIMENSIONS.map((dim, i) => (
              <Reveal key={dim.title} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-[2rem] border border-navy/10 bg-background p-7 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <dim.icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/35">
                      {dim.num}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-navy">{dim.title}</h3>
                  <p className="mt-2 leading-relaxed text-foreground/70">{dim.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dans le rapport ─────────────────────────────────── */}
      <section className="bg-background py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal">
                Le différenciateur clé
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
                Le rapport de compatibilité — généré au like.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/70">
                Dès que deux entreprises se likent mutuellement, Nedexia
                génère automatiquement un rapport complet : zones de
                complémentarité, score pondéré, nature du rapprochement,
                risques identifiés, prochaines étapes suggérées.
              </p>
              <p className="mt-4 font-eden text-lg italic text-navy/60">
                Le rapport remplace le premier appel à l’aveugle.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <PsychologyReportPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Garde-fou ────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-navy/10 bg-background px-6 py-6 sm:flex-row sm:items-center sm:px-8">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy/8 text-navy">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <p className="leading-relaxed text-foreground/70">
                <strong className="font-semibold text-navy">
                  Résultats indicatifs, jamais des verdicts.
                </strong>{" "}
                Aucun utilisateur n’est exclu d’un match sur la seule base de
                son profil psychologique — la couche humaine éclaire la
                décision, elle ne la prend jamais à votre place.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Appel à l’action ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-deep px-8 py-20 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-teal/20 blur-[100px]" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-leaf/15 blur-3xl" />
              <LeafShape className="absolute top-10 right-[12%] h-8 w-8 rotate-45 text-white/10" />
            </div>
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-5xl">
              La compatibilité se mesure.
              <br />
              <span className="bg-gradient-to-r from-leaf via-teal to-sky bg-clip-text text-transparent">
                La préparation se construit.
              </span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/65">
              Commencez avec Eden — votre dossier, incluant votre profil
              psychologique, se prépare en vue des bonnes rencontres.
            </p>
            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link
                href="/eden"
                className="inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-navy-deep transition-all hover:-translate-y-0.5 hover:bg-leaf"
              >
                Rencontrer Eden
              </Link>
              <Link
                href="/matching"
                className="group inline-flex items-center gap-2 text-base font-semibold text-white/75 transition-colors hover:text-white"
              >
                Voir Matching
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

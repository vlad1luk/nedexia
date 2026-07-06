import Link from "next/link";
import Hero from "./components/hero";
import { SproutIcon, InfinityIcon, GaugeIcon, LeafShape } from "./components/icons";

const modules = [
  {
    href: "/eden",
    label: "Eden",
    title: "Votre tuteur de croissance",
    description:
      "Une IA qui apprend à connaître votre entreprise, identifie ce qui freine sa croissance et vous guide, étape par étape, pour la rendre prête — comme un tuteur soutient une jeune pousse.",
    icon: SproutIcon,
    accent: "bg-leaf/15 text-leaf-deep",
    ring: "hover:border-leaf/60",
  },
  {
    href: "/matching",
    label: "Matching",
    title: "Des alliances qui prennent racine",
    description:
      "Quand vous êtes prêt, Eden vous connecte à des entreprises réellement compatibles — partenaires, alliés, acheteurs ou relève. Pas un annuaire ouvert : des mises en relation choisies.",
    icon: InfinityIcon,
    accent: "bg-teal/15 text-teal",
    ring: "hover:border-teal/60",
  },
  {
    href: "/score",
    label: "Score",
    title: "Mesurez votre préparation",
    description:
      "Un score clair qui reflète la maturité de votre entreprise : finances, structure, gouvernance, relève. Suivez sa progression et sachez exactement où concentrer vos efforts.",
    icon: GaugeIcon,
    accent: "bg-sun/20 text-coral",
    ring: "hover:border-sun/70",
  },
];

const journey = [
  {
    step: "1",
    season: "Semer",
    title: "Faites le point",
    description:
      "Évaluez la maturité de votre entreprise avec le Score Nedexia et voyez clairement vos forces et vos zones à cultiver.",
    color: "bg-sun text-navy-deep",
  },
  {
    step: "2",
    season: "Cultiver",
    title: "Devenez prêt",
    description:
      "Eden vous accompagne semaine après semaine : structurer vos finances, solidifier votre gouvernance, préparer la suite.",
    color: "bg-leaf text-navy-deep",
  },
  {
    step: "3",
    season: "Récolter",
    title: "Alliez-vous",
    description:
      "Le moment venu, rencontrez des entreprises compatibles pour grandir ensemble, vous allier ou transmettre en confiance.",
    color: "bg-teal text-white",
  },
];

const intentions = [
  {
    title: "Grandir",
    description: "Accélérer sans vous essouffler, avec un plan qui tient la route.",
    color: "text-leaf-deep bg-leaf/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 20h16" />
        <path d="M7 20V10m5 10V4m5 16v-9" />
      </svg>
    ),
  },
  {
    title: "Se structurer",
    description: "Passer d’une entreprise qui repose sur vous à une entreprise qui tient debout.",
    color: "text-sky bg-sky/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "S’allier",
    description: "Trouver des partenaires qui partagent vos valeurs et complètent vos forces.",
    color: "text-teal bg-teal/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="8" cy="12" r="5" />
        <circle cx="16" cy="12" r="5" />
      </svg>
    ),
  },
  {
    title: "Transmettre",
    description: "Préparer la relève et passer le flambeau au bon moment, aux bonnes mains.",
    color: "text-blossom bg-blossom/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 3v10" />
        <path d="M8 7l4-4 4 4" />
        <path d="M5 14v3a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      {/* ── Héro ─────────────────────────────────────────────── */}
      <Hero />

      {/* ── Les trois modules ────────────────────────────────── */}
      <section id="ecosysteme" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Un écosystème, trois saisons
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Chaque outil de Nedexia joue son rôle dans la croissance de votre
            entreprise — de la première pousse à la récolte.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`group rounded-3xl border border-navy/10 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${mod.ring}`}
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${mod.accent}`}>
                <mod.icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-foreground/50">
                {mod.label}
              </p>
              <h3 className="mt-1 text-xl font-bold text-navy">{mod.title}</h3>
              <p className="mt-3 leading-relaxed text-foreground/70">{mod.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                Explorer
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Le parcours ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              De la graine à la récolte
            </h2>
            <p className="mt-4 text-lg text-foreground/70">
              On ne force pas une plante à pousser. On la prépare, on la cultive,
              et la récolte vient d’elle-même.
            </p>
          </div>
          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-navy/15 md:block" aria-hidden="true" />
            {journey.map((step) => (
              <div key={step.step} className="relative text-center md:px-4">
                <span className={`relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold shadow-md ${step.color}`}>
                  {step.step}
                </span>
                <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-foreground/50">
                  {step.season}
                </p>
                <h3 className="mt-1 text-xl font-bold text-navy">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-foreground/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quatre intentions ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Peu importe votre saison, Eden vous accompagne
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {intentions.map((intent) => (
            <div key={intent.title} className="rounded-3xl border border-navy/10 bg-white p-7 shadow-sm">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${intent.color}`}>
                {intent.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">{intent.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{intent.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pas un annuaire ──────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Pas un annuaire. Un jardin.
            </h2>
            <p className="mt-4 text-lg text-foreground/70">
              Les annuaires B2B misent sur le volume. Nedexia mise sur la
              préparation et la compatibilité — parce qu’une alliance réussie se
              cultive avant de se conclure.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-navy/10 bg-background p-8">
              <h3 className="text-lg font-bold text-foreground/60">L’annuaire B2B ouvert</h3>
              <ul className="mt-5 space-y-4">
                {[
                  "Des milliers de profils, aucun contexte",
                  "Des approches à froid qui restent sans réponse",
                  "Aucune préparation avant la rencontre",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 h-5 w-5 shrink-0 text-coral/70">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-leaf/50 bg-gradient-to-br from-leaf/5 to-teal/5 p-8">
              <h3 className="text-lg font-bold text-navy">Le jardin Nedexia</h3>
              <ul className="mt-5 space-y-4">
                {[
                  "Un tuteur qui vous rend prêt avant de vous connecter",
                  "Des mises en relation choisies, au bon moment",
                  "Des entreprises réellement compatibles avec la vôtre",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-foreground/80">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-leaf-deep">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Appel à l’action ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-leaf/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />
            <LeafShape className="absolute top-10 right-[12%] h-8 w-8 rotate-45 text-white/10" />
            <LeafShape className="absolute bottom-10 left-[10%] h-10 w-10 -rotate-12 text-white/10" />
          </div>
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Votre entreprise est une graine.
            <br />
            Donnez-lui un jardin.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/70">
            Commencez par une conversation avec Eden — quelques minutes suffisent
            pour semer la suite.
          </p>
          <div className="relative mt-8">
            <Link
              href="/eden"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-navy transition-all hover:-translate-y-0.5 hover:bg-leaf hover:text-navy-deep"
            >
              Rencontrer Eden
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

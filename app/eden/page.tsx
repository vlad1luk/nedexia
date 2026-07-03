import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EdenDemo from "../components/eden-demo";
import MethodBento from "../components/method-bento";
import Reveal from "../components/reveal";
import SixMonths from "../components/six-months";
import symbole from "@/public/symbole-eden.png";

export const metadata: Metadata = {
  title: "Eden — Le tuteur de croissance | Nedexia",
  description:
    "Eden évalue votre entreprise, bâtit un plan de structuration et vous accompagne avec des tâches quotidiennes de 15 à 30 minutes. Du travail concret, mesuré par votre Score.",
};

const advisors = [
  {
    title: "Votre CPA",
    description:
      "Reçoit des livres tenus et des états préparés. Ses heures servent à vous conseiller — pas à reconstruire vos chiffres.",
  },
  {
    title: "Votre banquier",
    description:
      "Reçoit un dossier de financement complet, avec ratios à jour et prévisionnel structuré. Votre demande avance plus vite.",
  },
  {
    title: "Votre avocat",
    description:
      "Travaille à partir de conventions et de registres déjà organisés. Moins d’allers-retours, moins d’heures facturées.",
  },
];

export default function EdenPage() {
  return (
    <>
      {/* ── Héro ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
          <div className="absolute top-20 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 pt-20 text-center sm:px-6 sm:pt-24">
          <Reveal>
            <Image
              src={symbole}
              alt=""
              priority
              className="animate-float-subtle mx-auto h-14 w-auto sm:h-16"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Le tuteur qui structure votre entreprise, une tâche à la fois.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70 sm:text-xl">
              Eden commence par un diagnostic complet, bâtit votre plan de
              structuration, puis vous accompagne chaque jour avec des tâches de
              15 à 30 minutes. Du travail concret, mesuré par votre Score — pas
              des conseils génériques.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link
                href="/score"
                className="rounded-full bg-navy px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-navy-deep"
              >
                Commencer le diagnostic
              </Link>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 text-base font-semibold text-navy transition-colors hover:text-teal"
              >
                Voir Eden à l’œuvre
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-y-0.5">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Démo ─────────────────────────────────────────────── */}
      <section id="demo" className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20 pt-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Une vraie demande, un vrai plan de travail
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Votre banquier exige un prévisionnel? Eden le transforme en une
            semaine de tâches réalisables — et le document qui en sort est prêt
            à être déposé.
          </p>
        </Reveal>
        <div className="mt-12">
          <EdenDemo />
        </div>
      </section>

      {/* ── La méthode ───────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              D’abord comprendre. Ensuite bâtir.
            </h2>
            <p className="mt-4 text-lg text-foreground/70">
              Eden travaille comme un bon tuteur : il ne récite pas la théorie,
              il organise le travail et s’assure que ça avance.
            </p>
          </Reveal>
          <MethodBento />
        </div>
      </section>

      {/* ── Six mois d’écart ─────────────────────────────────── */}
      <SixMonths />

      {/* ── Vos conseillers ──────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Eden ne remplace pas vos conseillers. Il prépare leur travail.
            </h2>
            <p className="mt-4 text-lg text-foreground/70">
              Une entreprise structurée coûte moins cher à conseiller, à
              financer et à accompagner. Vos partenaires professionnels le
              voient dès le premier dossier.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {advisors.map((advisor, i) => (
              <Reveal key={advisor.title} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-navy/10 bg-background p-8">
                  <h3 className="text-lg font-bold text-navy">{advisor.title}</h3>
                  <p className="mt-3 leading-relaxed text-foreground/70">
                    {advisor.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Appel à l’action ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-leaf/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />
            </div>
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Le diagnostic prend 45 minutes.
              <br />
              Le reste, Eden le découpe pour vous.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/70">
              Commencez par évaluer votre entreprise — vous saurez exactement où
              elle en est, et par quoi commencer.
            </p>
            <div className="relative mt-8">
              <Link
                href="/score"
                className="inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-navy transition-all hover:-translate-y-0.5 hover:bg-leaf hover:text-navy-deep"
              >
                Commencer le diagnostic
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

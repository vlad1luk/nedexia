"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import symbole from "@/public/symbole-eden.png";

/**
 * Présentation du projet — /meeting-presentation
 * Un deck web sobre : navigation au clavier (← →) ou aux flèches à l'écran.
 * Réaliste et concret — pas un pitch : l'état du projet tel qu'il est.
 */

type SlideTheme = "light" | "navy";
type Slide = { id: string; theme: SlideTheme; content: React.ReactNode };

function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] ${
        dark ? "text-white/40" : "text-navy/40"
      }`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-leaf" />
      {children}
    </p>
  );
}

function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <h2
      className={`mt-5 font-eden text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl ${
        dark ? "text-white" : "text-navy"
      }`}
    >
      {children}
    </h2>
  );
}

const SLIDES: Slide[] = [
  // ─── 1 · Couverture ───
  {
    id: "couverture",
    theme: "navy",
    content: (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-3.5 shadow-[0_0_60px_-10px_rgba(153,202,60,0.55)]">
          <Image src={symbole} alt="" className="h-auto w-full" priority />
        </span>
        <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl">
          nedexia
        </h1>
        <p className="mt-3 font-eden text-xl italic text-white/70">
          L&rsquo;univers des affaires est infini.
        </p>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-white/80">
          Accompagner les PME québécoises d&rsquo;un point A à un point B —
          puis les connecter entre elles.
        </p>
        <p className="mt-12 text-sm text-white/40">
          Présentation du projet · juillet 2026 · Jérôme Reynaud &amp; Vlad Lukyanov
        </p>
      </div>
    ),
  },

  // ─── 2 · Le constat ───
  {
    id: "constat",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Le constat</Kicker>
        <H>
          Les dirigeants de PME sont seuls
          <br />
          au moment où ça compte.
        </H>
        <ul className="mt-10 max-w-2xl space-y-6">
          <li className="flex gap-4">
            <span aria-hidden className="mt-2.5 h-px w-8 shrink-0 bg-leaf" />
            <p className="text-lg leading-relaxed text-navy/75">
              L&rsquo;accompagnement traditionnel est ponctuel et coûteux : un
              mandat, un rapport, puis plus rien. Entre deux rencontres, le
              dirigeant retombe seul face aux décisions.
            </p>
          </li>
          <li className="flex gap-4">
            <span aria-hidden className="mt-2.5 h-px w-8 shrink-0 bg-leaf" />
            <p className="text-lg leading-relaxed text-navy/75">
              Le Québec entre dans une vague de transferts d&rsquo;entreprises —
              et beaucoup de cédants arrivent mal préparés : valorisation
              inconnue, dépendance au fondateur, dossier incomplet.
            </p>
          </li>
          <li className="flex gap-4">
            <span aria-hidden className="mt-2.5 h-px w-8 shrink-0 bg-leaf" />
            <p className="text-lg leading-relaxed text-navy/75">
              Les outils numériques actuels répondent aux questions — mais ne
              font avancer personne. Une conversation n&rsquo;est pas un
              accompagnement.
            </p>
          </li>
        </ul>
      </div>
    ),
  },

  // ─── 3 · Nedexia en une phrase ───
  {
    id: "these",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Nedexia</Kicker>
        <H>
          Un tuteur qui prépare l&rsquo;entreprise.
          <br />
          Une plateforme qui la connecte.
        </H>
        <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal">
              1 · L&rsquo;accompagnement
            </p>
            <p className="mt-3 text-lg leading-relaxed text-navy/75">
              Eden, tuteur de croissance, mène chaque entreprise vers son
              objectif — croître, s&rsquo;allier, transmettre — et construit en
              chemin un dossier structuré et à jour.
            </p>
          </div>
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal">
              2 · Le réseau
            </p>
            <p className="mt-3 text-lg leading-relaxed text-navy/75">
              Ces dossiers qualifiés alimentent la mise en relation : matching
              B2B, partenaires, repreneurs. On ne connecte que des entreprises
              prêtes.
            </p>
          </div>
        </div>
        <p className="mt-10 font-eden text-xl italic text-navy/60">
          L&rsquo;accompagnement crée la donnée. La donnée crée le réseau.
        </p>
      </div>
    ),
  },

  // ─── 4 · Eden ≠ chatbot ───
  {
    id: "eden",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Eden</Kicker>
        <H>Un tuteur. Pas un chatbot.</H>
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 bg-white/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/40">
              Un chatbot
            </p>
            <ul className="mt-4 space-y-3 text-[1.05rem] leading-relaxed text-navy/55">
              <li>Attend qu&rsquo;on lui parle</li>
              <li>Répond à la question posée</li>
              <li>Oublie tout entre deux sessions</li>
              <li>Produit du texte</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-leaf/50 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(107,158,33,0.6)]">
            <p className="text-sm font-semibold uppercase tracking-wider text-leaf-deep">
              Eden
            </p>
            <ul className="mt-4 space-y-3 text-[1.05rem] leading-relaxed text-navy/80">
              <li>Ouvre la séance lui-même, fait le point</li>
              <li>Donne les actions de la semaine — sans qu&rsquo;on les demande</li>
              <li>Tient le dossier, la mémoire, le programme de jalons</li>
              <li>Agit : tâches, documents, score — et relance quand ça stagne</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },

  // ─── 5 · Le parcours produit ───
  {
    id: "parcours",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Le produit — fonctionnel aujourd&rsquo;hui</Kicker>
        <H>Du diagnostic au plan d&rsquo;action.</H>
        <ol className="mt-10 max-w-2xl space-y-5">
          {[
            [
              "Diagnostic guidé",
              "Le dirigeant présente son entreprise et son intention : croître, s'allier, céder, acquérir, se structurer.",
            ],
            [
              "Score sur 100",
              "Cinq dimensions pondérées — clarté, indépendance, finances, structure, réputation. Le score évolue avec le dossier.",
            ],
            [
              "Programme jalonné",
              "Un itinéraire vers l'objectif, jalon par jalon — visible en permanence, mis à jour par Eden.",
            ],
            [
              "Séances et actions",
              "Trois actions par semaine, pas dix. Eden crée, suit, relance — et demande des comptes quand rien ne bouge.",
            ],
            [
              "Documents",
              "Il analyse ce qu'on lui dépose (états financiers, plan d'affaires) et rédige des livrables : fiches synthèse, notes de préparation.",
            ],
          ].map(([title, desc], i) => (
            <li key={title as string} className="flex gap-5">
              <span className="font-eden text-2xl font-semibold tabular-nums text-leaf-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-lg font-semibold text-navy">{title}</p>
                <p className="mt-0.5 leading-relaxed text-navy/60">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    ),
  },

  // ─── 6 · La méthode encodée ───
  {
    id: "methode",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Ce qui rend Eden crédible</Kicker>
        <H>Une méthode de terrain, encodée.</H>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-navy/75">
          Eden n&rsquo;improvise pas : il applique la méthode de Jérôme Reynaud —
          8 ans d&rsquo;accompagnement de PME québécoises, 97&nbsp;% de succès
          sur les dossiers de financement public — transcrite en règles de
          comportement systématiques.
        </p>
        <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {[
            "Les ventes avant le financement.",
            "Le projet avant la subvention.",
            "L'humain avant l'entreprise.",
            "Jamais un chiffre inventé : le mécanisme, l'ordre de grandeur, puis la source qui fait foi — CPA, banquier, programme.",
          ].map((r) => (
            <p
              key={r}
              className="rounded-xl border border-navy/10 bg-white px-5 py-4 font-eden text-[1.05rem] leading-snug text-navy/80"
            >
              {r}
            </p>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-navy/45">
          Cette base est vivante : elle s&rsquo;enrichit à chaque session de
          travail avec Jérôme.
        </p>
      </div>
    ),
  },

  // ─── 7 · Le modèle à deux couches ───
  {
    id: "modele",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Le modèle</Kicker>
        <H>Deux couches, un même dossier.</H>
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal">
              Les PME
            </p>
            <p className="mt-3 text-lg leading-relaxed text-navy/75">
              Eden au quotidien : le tuteur, le score, le plan d&rsquo;action,
              les livrables. La relation qui fait avancer l&rsquo;entreprise
              semaine après semaine.
            </p>
          </div>
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal">
              Les partenaires institutionnels
            </p>
            <p className="mt-3 text-lg leading-relaxed text-navy/75">
              CPA, banques, organismes de développement : des dossiers
              d&rsquo;entreprise structurés, à jour et qualifiés — au lieu de
              dossiers incomplets à reconstruire.
            </p>
          </div>
        </div>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-navy/60">
          Le dossier qu&rsquo;Eden construit est exactement celui qu&rsquo;un
          CPA, un banquier ou un acquéreur demande. C&rsquo;est le pont entre
          les deux couches.
        </p>
      </div>
    ),
  },

  // ─── 8 · Où en est le projet ───
  {
    id: "etat",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>Où en est le projet</Kicker>
        <H>Ce qui existe. Ce qui vient.</H>
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-leaf/40 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-leaf-deep">
              Fonctionnel aujourd&rsquo;hui
            </p>
            <ul className="mt-4 space-y-2.5 text-[1.05rem] leading-relaxed text-navy/80">
              <li>Tunnel de diagnostic et Score</li>
              <li>Espace entreprise complet avec Eden</li>
              <li>Mémoire, programme, actions, relances</li>
              <li>Analyse de documents et livrables</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-navy/10 bg-white/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/40">
              En construction
            </p>
            <ul className="mt-4 space-y-2.5 text-[1.05rem] leading-relaxed text-navy/55">
              <li>Matching B2B entre entreprises prêtes</li>
              <li>Score vérifié (validation par pièces)</li>
              <li>Réseau de partenaires institutionnels</li>
              <li>Préparation cession approfondie (SPC)</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-navy/60">
          Le choix est assumé : la valeur d&rsquo;accompagnement d&rsquo;abord.
          Le réseau s&rsquo;ouvre quand les dossiers sont prêts — pas avant.
        </p>
      </div>
    ),
  },

  // ─── 9 · L'équipe ───
  {
    id: "equipe",
    theme: "light",
    content: (
      <div className="flex h-full flex-col justify-center">
        <Kicker>L&rsquo;équipe</Kicker>
        <H>La méthode et le produit.</H>
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-xl font-semibold text-navy">Jérôme Reynaud</p>
            <p className="mt-1 text-sm font-medium uppercase tracking-wider text-teal">
              La méthode
            </p>
            <p className="mt-3 text-lg leading-relaxed text-navy/70">
              8 ans d&rsquo;accompagnement terrain de PME québécoises.
              97&nbsp;% de taux de succès sur les dossiers de financement
              public. C&rsquo;est sa pratique qui programme Eden.
            </p>
          </div>
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <p className="text-xl font-semibold text-navy">Vlad Lukyanov</p>
            <p className="mt-1 text-sm font-medium uppercase tracking-wider text-teal">
              Le produit
            </p>
            <p className="mt-3 text-lg leading-relaxed text-navy/70">
              Conception et développement de la plateforme : le tuteur, le
              score, l&rsquo;espace entreprise — l&rsquo;ensemble de ce que
              vous verrez en démonstration.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // ─── 10 · Discussion ───
  {
    id: "discussion",
    theme: "navy",
    content: (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Kicker dark>Discussion</Kicker>
        <h2 className="mt-5 font-eden text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
          Ce qu&rsquo;on aimerait valider avec vous.
        </h2>
        <ul className="mt-10 max-w-xl space-y-4 text-left text-lg leading-relaxed text-white/80">
          <li className="flex gap-4">
            <span aria-hidden className="mt-3 h-px w-8 shrink-0 bg-leaf" />
            Votre lecture du modèle à deux couches — PME et partenaires
            institutionnels.
          </li>
          <li className="flex gap-4">
            <span aria-hidden className="mt-3 h-px w-8 shrink-0 bg-leaf" />
            Les priorités de la feuille de route : matching, Score vérifié,
            partenaires.
          </li>
          <li className="flex gap-4">
            <span aria-hidden className="mt-3 h-px w-8 shrink-0 bg-leaf" />
            Les conditions pour financer la prochaine étape.
          </li>
        </ul>
        <p className="mt-12 font-eden text-xl italic text-white/60">
          La démonstration parle mieux que les diapositives — allons-y.
        </p>
      </div>
    ),
  },
];

export default function Deck() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const dark = slide.theme === "navy";

  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => Math.min(SLIDES.length - 1, Math.max(0, i + dir)));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div
      className={`flex h-svh flex-col transition-colors duration-500 ${
        dark
          ? "bg-gradient-to-b from-navy-deep to-navy"
          : "bg-[#faf8f3]"
      }`}
    >
      {/* Progression */}
      <div className="h-1 shrink-0 bg-black/5">
        <motion.div
          animate={{ width: `${((index + 1) / SLIDES.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-leaf to-teal"
        />
      </div>

      {/* La diapositive */}
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.section
            key={slide.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-8 py-10 sm:px-12"
          >
            {slide.content}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Barre de navigation */}
      <div
        className={`flex shrink-0 items-center justify-between px-8 py-4 sm:px-12 ${
          dark ? "text-white/50" : "text-navy/45"
        }`}
      >
        <span className="text-xs tabular-nums">
          {index + 1} / {SLIDES.length}
        </span>

        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Diapositive ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-5 bg-leaf"
                  : `w-1.5 ${dark ? "bg-white/25 hover:bg-white/50" : "bg-navy/20 hover:bg-navy/40"}`
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Diapositive précédente"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-30 ${
              dark
                ? "border-white/20 hover:bg-white/10"
                : "border-navy/15 hover:bg-navy/5"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === SLIDES.length - 1}
            aria-label="Diapositive suivante"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-30 ${
              dark
                ? "border-white/20 hover:bg-white/10"
                : "border-navy/15 hover:bg-navy/5"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

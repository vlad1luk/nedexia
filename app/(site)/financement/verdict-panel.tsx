"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";

import { type Verdict } from "@/lib/financement/verdict";
import { GrowthRing } from "./growth-ring";

/**
 * Le verdict — affiché IMMÉDIATEMENT à la fin du tunnel, en clair, sans
 * compte ni courriel. Règle de parcours : la valeur d'abord.
 *
 * Le montant se révèle au centre de l'anneau de croissance (l'élément
 * signature de la page) — la seconde et dernière fois qu'il apparaît.
 *
 * Ordre imposé :
 *   1. verdict complet (montant révélé, portion finançable, programmes, étapes) ;
 *   2. ensuite seulement, la capture courriel (version détaillée) ;
 *   3. enfin, la relance d'Eden.
 */

type Props = { verdict: Verdict };

const CURRENCY = {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
} as const;

export function VerdictPanel({ verdict }: Props) {
  const reduce = useReducedMotion();
  const [amount, setAmount] = useState(
    reduce ? verdict.montantEstime : { min: 0, max: 0 }
  );

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setAmount(verdict.montantEstime), 500);
    return () => clearTimeout(t);
  }, [reduce, verdict.montantEstime]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-10"
    >
      {/* 1 ── L'anneau révèle le montant */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brass">
          Votre verdict
        </span>
        <GrowthRing size={240} rings={5} animate={!reduce}>
          <div className="flex flex-col items-center gap-1">
            <span className="font-[family-name:var(--font-fraunces)] text-[1.55rem] font-medium leading-none tabular-nums text-ink sm:text-3xl">
              <NumberFlow value={amount.min} locales="fr-CA" format={CURRENCY} />
            </span>
            <span className="font-[family-name:var(--font-fraunces)] text-xs italic text-ink-soft">
              à
            </span>
            <span className="font-[family-name:var(--font-fraunces)] text-[1.55rem] font-medium leading-none tabular-nums text-rust sm:text-3xl">
              <NumberFlow value={amount.max} locales="fr-CA" format={CURRENCY} />
            </span>
          </div>
        </GrowthRing>
        <p className="max-w-lg text-sm leading-relaxed text-ink-soft">
          {verdict.portionFinancable}
        </p>
        <span className="border border-ink/15 px-3 py-1 text-[0.64rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
          Estimation indicative · à confirmer avec Eden
        </span>
      </div>

      {/* Programmes admissibles — entrées de registre */}
      <div className="flex flex-col">
        <h4 className="border-b border-ink/15 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
          Vos programmes les plus prometteurs
        </h4>
        {verdict.programmes.map((p, i) => (
          <motion.article
            key={p.nom}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.12 }}
            className="flex gap-4 border-b border-ink/10 py-5"
          >
            <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-ink">
                  {p.nom}
                </span>
                <span className="text-xs text-ink-soft">{p.organisme}</span>
              </div>
              <span className="self-start border border-moss/30 bg-moss/8 px-2.5 py-0.5 text-xs font-medium text-moss">
                {p.couverture}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{p.angle}</p>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Prochaines étapes — jalons d'encre */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="border-b border-ink/15 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass">
          Votre chemin vers l&rsquo;obtention
        </h4>
        <ol className="mt-1 flex flex-col">
          {verdict.prochainesEtapes.map((etape, i) => (
            <li key={etape} className="flex gap-4 border-b border-dotted border-ink/12 py-3.5 last:border-b-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/25 text-[0.68rem] font-semibold text-ink">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{etape}</p>
            </li>
          ))}
        </ol>
      </motion.div>

      {/* 2 ── Capture courriel — APRÈS le verdict, jamais avant */}
      <EmailCapture />

      {/* 3 ── Relance Eden */}
      <EdenRelance />
    </motion.div>
  );
}

/**
 * Version détaillée par courriel → c'est ici (et seulement ici) que la
 * création d'espace commence.
 *
 * TODO(capture) : brancher la soumission — route handler qui enregistre le
 * courriel + les réponses du diagnostic, envoie la version détaillée et
 * amorce la création de compte (Supabase, comme /espace/bienvenue).
 */
function EmailCapture() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="border border-ink/15 bg-white/40 px-5 py-6 sm:px-7">
      {sent ? (
        <p className="text-sm leading-relaxed text-ink-soft">
          <strong className="font-semibold text-ink">C&rsquo;est noté.</strong>{" "}
          Votre verdict détaillé arrive dans votre boîte courriel — avec le
          lien pour créer votre espace et le conserver.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim().length < 5) return;
            // TODO(capture) : POST vers l'API (voir commentaire ci-dessus).
            setSent(true);
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <h4 className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-ink">
              Recevez votre verdict détaillé par courriel
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              La version complète — critères d&rsquo;admissibilité, montants
              par programme, documents à préparer — et votre espace pour la
              conserver.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.ca"
              className="w-full flex-1 border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-rust focus:outline-none"
            />
            <button
              type="submit"
              className="border border-ink bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-parchment transition-colors hover:bg-[#232e3d]"
            >
              Recevoir
            </button>
          </div>
          <p className="text-xs text-ink-soft/70">
            Optionnel — votre verdict reste affiché ici quoi qu&rsquo;il arrive.
          </p>
        </form>
      )}
    </div>
  );
}

/** « Donner d'abord, demander ensuite » — l'invitation d'Eden clôt le parcours. */
function EdenRelance() {
  return (
    <div className="border-l-2 border-moss/40 pl-5">
      <p className="text-sm leading-relaxed text-ink-soft">
        Voulez-vous qu&rsquo;on aille chercher ce financement{" "}
        <strong className="font-medium text-ink">ensemble</strong> ? Eden vous
        guide étape par étape — du dossier prioritaire jusqu&rsquo;au dépôt.
      </p>
      {/* TODO(parcours) : destination finale à confirmer — pour l'instant,
          on présente Eden sans toucher à l'onboarding existant. */}
      <Link
        href="/eden"
        className="mt-4 inline-flex items-center gap-2 border border-ink/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-rust hover:text-rust"
      >
        Oui — on y va avec Eden
      </Link>
    </div>
  );
}

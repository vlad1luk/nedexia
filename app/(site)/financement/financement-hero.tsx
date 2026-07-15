"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";

import { GrowthRing } from "./growth-ring";
import { StartDiagnosticButton } from "./start-diagnostic-button";

/**
 * Hero de /financement — carnet de terrain, pas SaaS pastel.
 *
 * Layout asymétrique : étiquette de spécimen + titre serif alignés à
 * gauche, l'anneau de croissance décoratif décalé à droite. Fond
 * parchemin plat (aucun dégradé mint/crème), une seule couleur de risque
 * (rouille) réservée au CTA et à l'accent du sous-titre.
 */
export function FinancementHero() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? 2700 : 0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setCount(2700), 400);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <section className="relative overflow-hidden bg-parchment pt-16 pb-20 sm:pt-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        {/* Colonne texte */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3 border-b border-ink/15 pb-3"
          >
            <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
              N&deg;01
            </span>
            <span className="h-3 w-px bg-ink/15" />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
              Diagnostic financement · Québec, Canada
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className="mt-7 text-balance font-[family-name:var(--font-fraunces)] text-[2.6rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-[3.4rem] lg:text-[3.75rem]"
          >
            Le financement auquel votre entreprise a droit.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.14 }}
            className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl italic text-rust sm:text-3xl"
          >
            En 10 minutes. Gratuitement.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.22 }}
            className="mt-6 max-w-xl text-balance text-[1.05rem] leading-relaxed text-ink-soft"
          >
            Il existe plus de{" "}
            <span className="font-semibold text-ink tabular-nums">
              <NumberFlow value={count} locales="fr-CA" />
            </span>{" "}
            programmes de financement pour les entreprises québécoises. Le
            problème n&rsquo;est pas de les trouver — c&rsquo;est de savoir
            comment appliquer pour faire financer vos projets de croissance.
            C&rsquo;est exactement ce que ce diagnostic vous révèle : vos
            programmes réels, et le chemin pour les obtenir.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-5"
          >
            <StartDiagnosticButton>Commencer mon diagnostic</StartDiagnosticButton>
            <span className="text-xs uppercase tracking-[0.14em] text-ink-soft">
              Résultat immédiat · sans compte
            </span>
          </motion.div>

          {/* Bande de preuves — registre typographique, pas des tuiles de verre.
              TODO : chiffres réels à confirmer avant mise en ligne. */}
          <motion.dl
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.38 }}
            className="mt-14 grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/15 pt-5"
          >
            <Stat value="97 %" label="taux d’obtention" />
            <Stat value="2,5 M$+" label="sécurisés pour nos PME" />
            <Stat value="10 ans" label="d’expertise terrain" />
          </motion.dl>
        </div>

        {/* Colonne instrument — l'anneau de croissance, décalé, ambiant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative hidden items-center justify-center lg:flex"
        >
          <GrowthRing size={340} rings={5} className="opacity-90">
            <div className="flex flex-col items-center gap-1">
              <span className="font-[family-name:var(--font-fraunces)] text-xs italic text-ink-soft">
                dix années
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-brass">
                de croissance mesurée
              </span>
            </div>
          </GrowthRing>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 first:pl-0">
      <dt className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-ink">
        {value}
      </dt>
      <dd className="text-[0.7rem] leading-snug text-ink-soft">{label}</dd>
    </div>
  );
}

"use client";

import { motion } from "motion/react";

import { StartDiagnosticButton } from "../financement/start-diagnostic-button";

const signals = [
  { label: "Pistes prioritaires", value: "4" },
  { label: "Montant estimé", value: "chiffré" },
  { label: "Première lecture", value: "10 min" },
];

const prepSteps = [
  { label: "Profil de l’entreprise", state: "done" },
  { label: "Projet à financer", state: "done" },
  { label: "Capacité de dépôt", state: "next" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#14241f] text-[#f4f1e8]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(244,241,232,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(244,241,232,0.08)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <div className="pointer-events-none absolute -right-32 top-16 h-[30rem] w-[30rem] rounded-full border border-[#d9ee62]/15 sm:h-[42rem] sm:w-[42rem]">
        <div className="absolute inset-8 rounded-full border border-[#d9ee62]/10" />
        <div className="absolute inset-20 rounded-full border border-[#d9ee62]/10" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(25rem,0.78fr)] lg:items-center lg:gap-20 lg:px-10 lg:pt-24">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d9ee62]"
          >
            <span className="h-2 w-2 bg-[#ff8b5c]" />
            Financement accompagné · PME québécoises
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
            className="mt-8 max-w-3xl text-balance font-[family-name:var(--font-fraunces)] text-[3.35rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.8rem]"
          >
            Le financement commence par une entreprise{" "}
            <em className="text-[#d9ee62]">prête.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-7 max-w-2xl text-lg leading-relaxed text-[#d8dfd6] sm:text-xl"
          >
            Nedexia vous dit quoi viser, combien vous pouvez aller chercher et
            vous accompagne pour rendre votre dossier réellement finançable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
          >
            <StartDiagnosticButton className="bg-[#d9ee62] !text-[#14241f] hover:bg-[#e8f797] before:bg-[#ff8b5c]">
              Voir mon potentiel de financement
              <span aria-hidden className="text-lg leading-none">↗</span>
            </StartDiagnosticButton>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#aab9ab]">
              Gratuit · sans compte · résultat immédiat
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-14 grid max-w-2xl grid-cols-3 border-t border-[#f4f1e8]/20 pt-5"
          >
            {signals.map((signal) => (
              <div key={signal.label} className="border-r border-[#f4f1e8]/15 px-4 first:pl-0 last:border-0">
                <p className="font-[family-name:var(--font-fraunces)] text-2xl text-[#f4f1e8] sm:text-3xl">{signal.value}</p>
                <p className="mt-1 max-w-[8rem] text-[0.67rem] leading-snug text-[#aab9ab]">{signal.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.18, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[28rem] lg:mx-0 lg:justify-self-end"
        >
          <div className="absolute -left-4 top-10 z-10 hidden border border-[#f4f1e8]/20 bg-[#20342d] px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-[#d9ee62] shadow-[8px_8px_0_rgba(9,16,14,0.28)] sm:block">
            Exemple de verdict
          </div>
          <div className="relative border border-[#f4f1e8]/25 bg-[#f4f1e8] p-5 text-[#14241f] shadow-[16px_18px_0_rgba(9,16,14,0.28)] sm:p-7">
            <div className="flex items-start justify-between border-b border-[#14241f]/15 pb-5">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#5b6d62]">Nedexia / 01</p>
                <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl font-medium leading-tight">Votre potentiel de financement</h2>
              </div>
              <span className="flex h-9 w-9 items-center justify-center border border-[#14241f]/20 text-lg">↗</span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-5 border-b border-[#14241f]/15 py-6">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#d9ee62] sm:h-32 sm:w-32">
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-[#14241f]/10 border-l-transparent border-b-transparent" />
                <div className="text-center">
                  <p className="font-[family-name:var(--font-fraunces)] text-4xl leading-none">74</p>
                  <p className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#5b6d62]">préparation</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Une base solide.</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5b6d62]">Votre projet est identifiable. Il reste à structurer les éléments qui feront la différence au dépôt.</p>
              </div>
            </div>

            <div className="py-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#5b6d62]">Projet numérique</p>
                  <p className="mt-1 font-[family-name:var(--font-fraunces)] text-xl">4 pistes prioritaires</p>
                </div>
                <p className="font-[family-name:var(--font-fraunces)] text-2xl text-[#e86845]">85 000 $</p>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {prepSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3 text-sm">
                    <span className={step.state === "done" ? "flex h-5 w-5 items-center justify-center bg-[#14241f] text-[0.62rem] font-bold text-[#d9ee62]" : "flex h-5 w-5 items-center justify-center border border-[#e86845] text-[0.62rem] font-bold text-[#e86845]"}>{step.state === "done" ? "✓" : index + 1}</span>
                    <span className={step.state === "next" ? "font-semibold" : "text-[#5b6d62]"}>{step.label}</span>
                    {step.state === "next" ? <span className="ml-auto text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#e86845]">À faire</span> : null}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#14241f]/15 pt-4 text-[0.68rem] text-[#5b6d62]">Un verdict concret. Un chemin pour le rendre réel.</div>
          </div>
        </motion.div>
      </div>

      <div className="relative border-t border-[#f4f1e8]/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#9eb09f] sm:px-8 lg:px-10">
          <span>Le bon programme ne suffit pas.</span>
          <span className="hidden sm:inline">Il faut aussi être prêt à le déposer.</span>
          <span aria-hidden className="text-[#d9ee62]">↓</span>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEspace } from "./../espace-context";
import { DetailLink, money, PageHeader, Panel } from "./../ui";

/**
 * Financement — le dossier suivi : programmes admissibles, portion
 * finançable, montant estimé, statut, prochaine étape.
 *
 * POINT D'INTÉGRATION : tant qu'aucun suivi de dossier n'est persisté
 * (voir FinancementSummary dans espace-context), la page affiche son état
 * d'invitation honnête — aucun chiffre inventé. Le rendu peuplé est prêt.
 */

const STATUS_LABEL = {
  a_preparer: "Dossier à préparer",
  en_cours: "Dossier en cours",
  depose: "Dossier déposé",
} as const;

const LIVRABLES = [
  "Vos programmes admissibles — pas la liste théorique, les vôtres",
  "La portion finançable de votre projet",
  "Le montant estimé, fondé sur les règles réelles des programmes",
  "Votre prochaine étape, jusqu'au dépôt",
] as const;

export default function FinancementPage() {
  const { financement } = useEspace();

  if (!financement) {
    return (
      <>
        <PageHeader
          title="Financement"
          lede="Le suivi de votre dossier vivra ici — programmes, montants, statut, prochaine étape."
        />
        <div className="flex flex-col gap-4">
          <Panel label="Par où commencer">
            <p className="text-sm leading-relaxed text-ink-soft">
              Plus de 2 700 programmes financent les PME québécoises. Le
              diagnostic financement vous remet un verdict chiffré en dix
              minutes :
            </p>
            <ul className="mt-4 flex flex-col border-t border-ink/15">
              {LIVRABLES.map((item, i) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 border-b border-dotted border-ink/20 py-3 text-sm text-ink"
                >
                  <span className="font-eden text-sm italic text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <DetailLink href="/financement">
              Faire mon diagnostic financement · 10 min
            </DetailLink>
          </Panel>

          <Panel label="Ensuite">
            <p className="text-sm leading-relaxed text-ink-soft">
              Une fois le verdict en main, Eden découpe le dépôt en tâches de
              15 à 30 minutes et suit l&rsquo;avancement du dossier avec vous —
              le statut, les montants et la prochaine étape s&rsquo;afficheront
              sur cette page.
            </p>
          </Panel>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Financement"
        meta={
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-rust">
            {STATUS_LABEL[financement.status]}
          </span>
        }
      />
      <div className="flex flex-col gap-4">
        <Panel label="Montant estimé">
          <div className="flex items-baseline gap-2">
            <span className="font-eden text-5xl font-medium leading-none text-ink tabular-nums">
              {money.format(financement.estimatedAmount)}
            </span>
          </div>
          <dl className="mt-5 flex flex-col border-t border-ink/15">
            <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink/20 py-3">
              <dt className="text-sm text-ink-soft">Programmes admissibles</dt>
              <dd className="font-mono text-sm tabular-nums text-ink">
                {financement.programCount}
              </dd>
            </div>
            {financement.fundablePortion != null && (
              <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink/20 py-3">
                <dt className="text-sm text-ink-soft">Portion finançable</dt>
                <dd className="font-mono text-sm tabular-nums text-ink">
                  {financement.fundablePortion}%
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-sm text-ink-soft">Prochaine étape</dt>
              <dd className="max-w-[60%] text-right text-sm font-medium text-ink">
                {financement.nextStep}
              </dd>
            </div>
          </dl>
        </Panel>
        <p className="text-xs text-ink-soft">
          Besoin d&rsquo;un second verdict pour un autre projet ?{" "}
          <Link href="/financement" className="font-medium text-ink hover:text-rust">
            Refaire un diagnostic
          </Link>
        </p>
      </div>
    </>
  );
}

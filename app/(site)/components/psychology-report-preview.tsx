/**
 * Aperçu du rapport de compatibilité — élément signature de /psychologie.
 *
 * Spécimen de grand livre (parchemin / encre / laiton), pas une carte SaaS
 * ombrée. Structure fidèle au rapport produit : score global, sous-scores,
 * convergence / tension, recommandation.
 */

function ReportRow({
  label,
  value,
  indent,
  mini,
}: {
  label: string;
  value: number;
  indent?: boolean;
  mini?: boolean;
}) {
  return (
    <li
      className={`grid items-center gap-3 border-b border-dotted border-ink/15 py-2.5 last:border-b-0 ${
        mini ? "grid-cols-[1fr_56px_2rem]" : "grid-cols-[1fr_5.5rem_2.25rem]"
      } ${indent || mini ? "pl-3 sm:pl-4" : ""}`}
    >
      <span
        className={`text-[13px] leading-snug ${
          mini ? "text-ink-soft" : "font-medium text-ink"
        }`}
      >
        {label}
      </span>
      <span className="h-1 w-full overflow-hidden bg-ink/10">
        <span
          className={`block h-full ${mini ? "bg-moss-soft/70" : "bg-moss"}`}
          style={{ width: `${value}%` }}
        />
      </span>
      <span
        className={`text-right font-[family-name:var(--font-fraunces)] tabular-nums ${
          mini ? "text-[11px] text-ink-soft" : "text-[13px] text-ink"
        }`}
      >
        {value}%
      </span>
    </li>
  );
}

export default function PsychologyReportPreview() {
  return (
    <div className="border border-ink/15 bg-parchment text-ink shadow-[3px_4px_0_0_rgba(27,36,48,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-ink/15 bg-ink px-5 py-3.5 sm:px-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-parchment/60">
          Rapport de compatibilité
        </p>
        <span className="font-[family-name:var(--font-fraunces)] text-xs italic text-brass">
          Recommandé
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Score global
          </p>
          <p className="font-[family-name:var(--font-fraunces)] text-4xl font-medium leading-none tracking-tight text-ink sm:text-[2.6rem]">
            82&nbsp;%
          </p>
        </div>

        <ul className="mt-2">
          <ReportRow label="Sectorielle & financière" value={78} />
          <ReportRow label="Psychologique globale" value={85} indent />
          <ReportRow label="Style post-acquisition" value={80} mini />
          <ReportRow label="Rapport à l'héritage" value={94} mini />
          <ReportRow label="Communication & décision" value={82} mini />
          <ReportRow label="Vision stratégique" value={83} />
        </ul>

        <div className="mt-5 grid gap-0 border border-ink/15 sm:grid-cols-2">
          <div className="border-b border-ink/15 px-3.5 py-3 sm:border-b-0 sm:border-r">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-moss">
              Convergence
            </p>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-ink">
              <li className="flex items-start gap-1.5">
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-fraunces)] text-xs italic text-moss"
                >
                  ✓
                </span>
                <span>Horizon 12–18 mois aligné</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-fraunces)] text-xs italic text-moss"
                >
                  ✓
                </span>
                <span>Approche collaborative</span>
              </li>
            </ul>
          </div>
          <div className="bg-parchment-deep/50 px-3.5 py-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Tension
            </p>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-ink-soft">
              <li className="flex items-start gap-1.5">
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-fraunces)] text-xs italic text-rust/70"
                >
                  —
                </span>
                <span>Rythme de changement</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-fraunces)] text-xs italic text-rust/70"
                >
                  —
                </span>
                <span>Autonomie post-closing</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 border-t border-ink/15 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Recommandation · Connexion qualifiée
        </p>
      </div>
    </div>
  );
}

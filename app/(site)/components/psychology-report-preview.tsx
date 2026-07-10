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
      className={`grid items-center gap-3 ${
        mini ? "grid-cols-[1fr_60px_34px]" : "grid-cols-[1fr_100px_42px]"
      } ${indent ? "pt-1" : ""}`}
    >
      <span
        className={`text-[13px] leading-snug ${
          mini ? "pl-4 text-foreground/50" : "font-semibold text-navy"
        }`}
      >
        {label}
      </span>
      <span className={`h-1.5 w-full overflow-hidden rounded-full bg-navy/8 ${mini ? "opacity-70" : ""}`}>
        <span
          className={`block h-full rounded-full ${mini ? "bg-teal/70" : "bg-gradient-to-r from-leaf to-teal"}`}
          style={{ width: `${value}%` }}
        />
      </span>
      <span
        className={`text-right font-semibold tabular-nums ${
          mini ? "text-[11px] text-foreground/55" : "text-[13px] text-navy"
        }`}
      >
        {value}%
      </span>
    </li>
  );
}

/**
 * Aperçu du rapport de compatibilité — généré automatiquement au moment
 * d'un like mutuel. Reprend fidèlement la structure du rapport tel que
 * conçu : score global, sous-scores sectoriel/psychologique/stratégique,
 * zones de convergence et de tension, recommandation.
 */
export default function PsychologyReportPreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-navy/10 bg-white shadow-[0_30px_70px_-45px_rgba(35,35,96,0.35)]">
      <div className="flex items-center justify-between border-b border-navy/8 bg-navy-deep px-5 py-3.5 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
          Rapport de compatibilité
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-leaf">
          <CheckIcon className="h-2.5 w-2.5" />
          Recommandé
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-baseline justify-between border-b border-navy/8 pb-4">
          <p className="text-xs uppercase tracking-wider text-foreground/45">Score global</p>
          <p className="font-eden text-4xl font-semibold leading-none tracking-tight text-navy sm:text-[2.6rem]">
            82&nbsp;%
          </p>
        </div>

        <ul className="mt-5 space-y-2.5">
          <ReportRow label="Sectorielle &amp; financière" value={78} />
          <ReportRow label="Psychologique globale" value={85} indent />
          <ReportRow label="› Style post-acquisition" value={80} mini />
          <ReportRow label="› Rapport à l'héritage" value={94} mini />
          <ReportRow label="› Communication &amp; décision" value={82} mini />
          <ReportRow label="Vision stratégique" value={83} />
        </ul>

        <div className="mt-5 grid gap-2.5 border-t border-navy/8 pt-4 sm:grid-cols-2">
          <div className="rounded-xl border border-leaf/25 bg-leaf/8 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-leaf-deep">
              Convergence
            </p>
            <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-foreground/70">
              <li className="flex items-start gap-1.5">
                <CheckIcon className="mt-0.5 h-2.5 w-2.5 shrink-0 text-leaf-deep" />
                <span>Horizon 12–18 mois aligné</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckIcon className="mt-0.5 h-2.5 w-2.5 shrink-0 text-leaf-deep" />
                <span>Approche collaborative</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-navy/8 bg-background px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
              Tension
            </p>
            <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-foreground/70">
              <li className="flex items-start gap-1.5">
                <DashIcon className="mt-0.5 h-2.5 w-2.5 shrink-0 text-foreground/35" />
                <span>Rythme de changement</span>
              </li>
              <li className="flex items-start gap-1.5">
                <DashIcon className="mt-0.5 h-2.5 w-2.5 shrink-0 text-foreground/35" />
                <span>Autonomie post-closing</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 border-t border-navy/8 pt-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
          Recommandation · Connexion qualifiée
        </p>
      </div>
    </div>
  );
}

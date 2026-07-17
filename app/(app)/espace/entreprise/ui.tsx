import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Briques partagées des pages de l'espace — registre carnet.
 * Une seule signification par affordance : bordure pleine = information,
 * bordure pointillée = zone d'action (dépôt, invitation), rouille = action
 * ou alerte, mousse = acquis.
 */

export function PageHeader({
  title,
  lede,
  meta,
}: {
  title: string;
  lede?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-eden text-2xl font-medium text-ink">{title}</h1>
        {lede && (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">{lede}</p>
        )}
      </div>
      {meta && <div className="shrink-0 pb-0.5">{meta}</div>}
    </header>
  );
}

export function Panel({
  label,
  meta,
  children,
  className = "",
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-ink/15 bg-parchment p-5 sm:p-6 ${className}`}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brass">
          {label}
        </h2>
        {meta}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Lien discret « voir le détail » en pied de panneau. */
export function DetailLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-rust focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
    >
      {children}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform group-hover:translate-x-1"
        aria-hidden
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

/** Seuil d'accès au matching — « l'accès se cultive ». Voir /matching. */
export const MATCHING_THRESHOLD = 70;

export const money = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

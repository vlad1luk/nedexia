"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import logo from "@/public/logo-nedexia.png";
import symbole from "@/public/symbole-eden.png";
import type { Tier } from "@/lib/espace/types";
import { CommandPalette } from "./command-palette";
import { EdenPanel } from "./eden-panel";
import { useEspace } from "./espace-context";

/**
 * Le shell de l'espace — la discipline structurelle de Linear appliquée au
 * carnet : sidebar gauche persistante (une destination par domaine), contenu
 * central qui se remplace instantanément, panneau Eden rétractable à droite.
 * Sidebar et panneau restent montés au changement de page ; seul le centre
 * change. Sur mobile, la sidebar se transforme en barre d'onglets basse et
 * Eden devient un tiroir plein écran — rien ne disparaît.
 */

const BASE = "/espace/entreprise";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  /** Badge dynamique (clé lue dans le contexte au rendu). */
  badge?: "tasks";
};

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-[17px] w-[17px] shrink-0",
  "aria-hidden": true,
} as const;

const NAV: NavItem[] = [
  {
    href: BASE,
    label: "Accueil",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    href: `${BASE}/preparation`,
    label: "Préparation",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 21h18" />
        <path d="M5 21V13M10 21V8M15 21V11M20 21V5" />
      </svg>
    ),
  },
  {
    href: `${BASE}/programme`,
    label: "Programme",
    badge: "tasks",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <path d="M6 8.5v7M11.5 6H21M11.5 18H21" />
      </svg>
    ),
  },
  {
    href: `${BASE}/financement`,
    label: "Financement",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v9M9.5 15c.6.9 1.5 1.5 2.5 1.5 1.7 0 3-1 3-2.25S13.7 12 12 12s-3-1-3-2.25S10.3 7.5 12 7.5c1 0 1.9.6 2.5 1.5" />
      </svg>
    ),
  },
  {
    href: `${BASE}/documents`,
    label: "Documents",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M15 13H9M15 17H9" />
      </svg>
    ),
  },
  {
    href: `${BASE}/matching`,
    label: "Matching",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="9" cy="12" r="5.5" />
        <circle cx="15" cy="12" r="5.5" />
      </svg>
    ),
  },
];

const SETTINGS: NavItem = {
  href: `${BASE}/parametres`,
  label: "Paramètres",
  icon: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </svg>
  ),
};

/** Palier → teinte du repère. */
const TIER_DOT: Record<Tier, string> = {
  rouge: "bg-rust",
  orange: "bg-rust/55",
  jaune: "bg-brass",
  vert: "bg-moss",
};

function isActive(pathname: string, href: string) {
  return href === BASE ? pathname === BASE : pathname.startsWith(href);
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center bg-rust px-1 font-mono text-[0.62rem] font-semibold tabular-nums text-parchment">
      {count}
    </span>
  );
}

/** Menu du compte (sidebar) — clavier accessible. */
function AccountBlock() {
  const { companyName, displayName, email } = useEspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rust"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center border border-ink/20 bg-ink text-xs font-semibold text-parchment">
          {(companyName ?? displayName ?? email).charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.82rem] font-semibold leading-tight text-ink">
            {companyName ?? displayName}
          </span>
          <span className="block truncate text-[0.68rem] leading-tight text-ink-soft">
            {email}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-3 right-3 z-50 mb-1 animate-menu-pop border border-ink/15 bg-parchment shadow-[0_18px_45px_-28px_rgba(27,36,48,0.5)]"
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
          >
            Retour au site
          </Link>
          <a
            href="/auth/signout?next=/connexion"
            className="block px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-rust/8 hover:text-rust"
          >
            Se déconnecter
          </a>
        </div>
      )}
    </div>
  );
}

export function EspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    score,
    newTaskIds,
    edenDesktopOpen,
    edenMobileOpen,
    toggleEden,
    openEdenMobile,
    closeEden,
    edenUnread,
    setPaletteOpen,
    companyName,
    displayName,
  } = useEspace();

  const [moreOpen, setMoreOpen] = useState(false);

  const badgeCount = (key: NavItem["badge"]) =>
    key === "tasks" ? newTaskIds.length : 0;

  const navLink = (item: NavItem) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`relative flex items-center gap-3 px-4 py-2 text-[0.85rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rust ${
          active
            ? "bg-ink/5 font-semibold text-ink"
            : "text-ink-soft hover:bg-ink/[0.03] hover:text-ink"
        }`}
      >
        {active && (
          <span aria-hidden className="absolute inset-y-1 left-0 w-[2px] bg-rust" />
        )}
        {item.icon}
        <span className="truncate">{item.label}</span>
        <Badge count={badgeCount(item.badge)} />
      </Link>
    );
  };

  return (
    <div className="flex h-full min-h-0 bg-parchment-deep/60 text-ink">
      {/* ═══════════ SIDEBAR (desktop) ═══════════ */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/15 bg-parchment lg:flex">
        {/* Identité */}
        <div className="flex flex-col gap-1.5 border-b border-ink/15 px-4 py-4">
          <Link href="/" aria-label="Site Nedexia" className="w-fit">
            <Image src={logo} alt="Nedexia" className="h-5 w-auto" loading="eager" />
          </Link>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Espace entreprise
          </span>
        </div>

        {/* Score — même source de vérité que la page Préparation */}
        <Link
          href={`${BASE}/preparation`}
          className="flex items-baseline gap-2.5 border-b border-ink/15 px-4 py-3.5 transition-colors hover:bg-ink/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rust"
        >
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brass">
            Préparation
          </span>
          {score ? (
            <span className="ml-auto flex items-center gap-2">
              <span aria-hidden className={`h-1.5 w-1.5 ${TIER_DOT[score.tier]}`} />
              <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                {score.total}
              </span>
              <span className="text-[0.62rem] text-ink-soft">/100</span>
            </span>
          ) : (
            <span className="ml-auto font-eden text-xs italic text-ink-soft">
              à établir
            </span>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3" aria-label="Pages de l'espace">
          {NAV.map(navLink)}
        </nav>

        {/* Bas : Eden, palette, paramètres, compte */}
        <div className="border-t border-ink/15 py-2">
          <button
            type="button"
            onClick={toggleEden}
            className="flex w-full items-center gap-3 px-4 py-2 text-[0.85rem] text-ink-soft transition-colors hover:bg-ink/[0.03] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rust"
          >
            <span className="grid h-[17px] w-[17px] shrink-0 place-items-center">
              <Image src={symbole} alt="" className="h-full w-auto" />
            </span>
            <span>Parler à Eden</span>
            {edenUnread > 0 && !edenDesktopOpen ? (
              <Badge count={edenUnread} />
            ) : (
              <kbd className="ml-auto font-mono text-[0.62rem] text-ink-soft/60">⌘E</kbd>
            )}
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-2 text-[0.85rem] text-ink-soft transition-colors hover:bg-ink/[0.03] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rust"
          >
            <svg {...ICON_PROPS}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span>Rechercher…</span>
            <kbd className="ml-auto font-mono text-[0.62rem] text-ink-soft/60">⌘K</kbd>
          </button>
          {navLink(SETTINGS)}
        </div>
        <div className="border-t border-ink/15">
          <AccountBlock />
        </div>
      </aside>

      {/* ═══════════ COLONNE CENTRALE ═══════════ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre du haut (mobile) */}
        <header className="flex shrink-0 items-center gap-3 border-b border-ink/15 bg-parchment px-4 py-2.5 lg:hidden">
          <Link href="/" aria-label="Site Nedexia" className="shrink-0">
            <Image src={logo} alt="Nedexia" className="h-5 w-auto" loading="eager" />
          </Link>
          <span className="min-w-0 truncate text-sm font-semibold text-ink">
            {companyName ?? displayName}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            {score && (
              <Link
                href={`${BASE}/preparation`}
                className="flex items-center gap-1.5"
                aria-label={`Score de préparation ${score.total} sur 100`}
              >
                <span aria-hidden className={`h-1.5 w-1.5 ${TIER_DOT[score.tier]}`} />
                <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                  {score.total}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={openEdenMobile}
              className="relative inline-flex items-center gap-2 border border-ink/20 bg-parchment px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
            >
              <span className="grid h-4 w-4 place-items-center">
                <Image src={symbole} alt="" className="h-full w-auto" />
              </span>
              Eden
              {edenUnread > 0 && (
                <span
                  aria-label={`${edenUnread} nouveau(x) message(s)`}
                  className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-rust px-1 font-mono text-[0.6rem] font-semibold tabular-nums text-parchment"
                >
                  {edenUnread}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Contenu de page — seul élément qui change à la navigation */}
        <main className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>

        {/* Barre d'onglets basse (mobile) — la sidebar transformée */}
        <nav
          aria-label="Pages de l'espace"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink/15 bg-parchment lg:hidden"
        >
          {NAV.slice(0, 4).map((item) => {
            const active = isActive(pathname, item.href);
            const count = badgeCount(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[0.6rem] font-medium ${
                  active ? "text-ink" : "text-ink-soft"
                }`}
              >
                {active && (
                  <span aria-hidden className="absolute inset-x-3 top-0 h-[2px] bg-rust" />
                )}
                {item.icon}
                <span className="truncate">{item.label}</span>
                {count > 0 && (
                  <span
                    aria-hidden
                    className="absolute right-[22%] top-1.5 h-2 w-2 bg-rust"
                  />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            className="relative flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[0.6rem] font-medium text-ink-soft"
          >
            <svg {...ICON_PROPS}>
              <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
            </svg>
            <span>Plus</span>
          </button>
        </nav>

        {/* Feuille « Plus » (mobile) */}
        {moreOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-ink/30 lg:hidden"
            onClick={() => setMoreOpen(false)}
          >
            <div
              role="dialog"
              aria-label="Autres pages"
              className="w-full border-t border-ink/15 bg-parchment pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Toute navigation depuis la feuille la referme. */}
              <div
                className="flex flex-col py-2"
                onClickCapture={(e) => {
                  if ((e.target as HTMLElement).closest("a")) setMoreOpen(false);
                }}
              >
                {[...NAV.slice(4), SETTINGS].map(navLink)}
                <a
                  href="/auth/signout?next=/connexion"
                  className="flex items-center gap-3 px-4 py-2 text-[0.85rem] text-ink-soft"
                >
                  Se déconnecter
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ PANNEAU EDEN ═══════════ */}
      {/* Desktop : colonne en flux, rétractable. Mobile : tiroir plein écran. */}
      {edenDesktopOpen && (
        <aside
          aria-label="Eden, votre conseiller"
          className="hidden w-[400px] shrink-0 flex-col border-l border-ink/15 bg-parchment xl:flex"
        >
          <EdenPanel />
        </aside>
      )}

      {edenMobileOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-ink/30 xl:hidden">
          <button
            type="button"
            aria-label="Fermer Eden"
            onClick={closeEden}
            className="flex-1"
          />
          <div className="flex h-full w-full max-w-md flex-col border-l border-ink/15 bg-parchment shadow-2xl shadow-ink/25">
            <EdenPanel />
          </div>
        </div>
      )}

      <CommandPalette />
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import logo from "@/public/logo-nedexia.png";

/**
 * En-tête de l'application (espace connecté).
 * Volontairement distinct de la navbar du site : identité + compte, rien d'autre.
 */
export default function AppHeader({
  companyName,
  email,
}: {
  companyName: string | null;
  email: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const displayName = companyName ?? "Votre entreprise";
  const initial = (companyName ?? email).charAt(0).toUpperCase();

  return (
    <header className="z-40 shrink-0 border-b border-navy/8 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Site Nedexia"
            className="shrink-0 transition-opacity hover:opacity-80"
          >
            <Image src={logo} alt="Nedexia" className="h-5 w-auto sm:h-6" loading="eager" />
          </Link>
          <span className="h-6 w-px bg-navy/10" aria-hidden="true" />
          <div className="flex min-w-0 flex-col">
            <span className="text-[0.6rem] font-semibold uppercase leading-tight tracking-[0.18em] text-foreground/40">
              Espace entreprise
            </span>
            <span className="truncate text-sm font-semibold leading-tight text-navy">
              {displayName}
            </span>
          </div>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Menu du compte"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-navy to-teal text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-navy/25"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-64 animate-menu-pop overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl shadow-navy/10">
              <div className="flex items-center gap-3 border-b border-navy/5 px-4 py-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-navy to-teal text-sm font-semibold text-white"
                >
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">{displayName}</p>
                  <p className="truncate text-xs text-foreground/50">{email}</p>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 shrink-0 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 9.5L10 3l7 6.5" />
                    <path d="M5 8.5V17h10V8.5" />
                  </svg>
                  Retour au site
                </Link>
                <a
                  href="/auth/signout?next=/connexion"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-coral/8 hover:text-coral"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 shrink-0 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12.5 6.5V4.75A1.75 1.75 0 0 0 10.75 3h-5A1.75 1.75 0 0 0 4 4.75v10.5A1.75 1.75 0 0 0 5.75 17h5a1.75 1.75 0 0 0 1.75-1.75V13.5" />
                    <path d="M8 10h9m0 0l-2.5-2.5M17 10l-2.5 2.5" />
                  </svg>
                  Se déconnecter
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

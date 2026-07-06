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
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const initial = (companyName ?? email).charAt(0).toUpperCase();

  return (
    <header className="z-40 shrink-0 border-b border-navy/8 bg-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" aria-label="Site Nedexia" className="shrink-0">
            <Image src={logo} alt="Nedexia" className="h-5 w-auto sm:h-6" priority />
          </Link>
          <span className="h-5 w-px bg-navy/10" aria-hidden="true" />
          <span className="truncate text-sm font-semibold text-navy">
            {companyName ?? "Votre entreprise"}
          </span>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu du compte"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white transition-opacity hover:opacity-85"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl shadow-navy/10">
              <div className="border-b border-navy/5 px-4 py-3">
                <p className="truncate text-sm font-semibold text-navy">
                  {companyName ?? "Votre entreprise"}
                </p>
                <p className="truncate text-xs text-foreground/50">{email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  Retour au site
                </Link>
                <a
                  href="/auth/signout?next=/connexion"
                  className="block rounded-lg px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-navy/5 hover:text-navy"
                >
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

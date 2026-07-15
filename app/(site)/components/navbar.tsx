"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { fraunces } from "../financement/fonts";
import { createClient } from "@/lib/supabase/client";
import logo from "@/public/logo-nedexia.png";

/**
 * Barre de navigation — en-tête de page du « carnet de terrain » (voir
 * /financement) : bandeau parchemin plat souligné d'un filet d'encre,
 * liens en petites capitales, entrée active marquée au rouille. Pas de
 * pilule de verre flottante ni d'ombres SaaS. Le CTA reprend le bouton
 * « scellé » à coin coupé, en version compacte.
 */

const links = [
  { href: "/financement", label: "Financement" },
  { href: "/eden", label: "Eden" },
  { href: "/matching", label: "Matching" },
  { href: "/psychologie", label: "Psychologie" },
  { href: "/score", label: "Score" },
];

const NOTCH = {
  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const authHref = userEmail ? "/espace/entreprise" : "/connexion";
  const authLabel = userEmail ? "Mon espace" : "Connexion";

  return (
    <header
      className={`${fraunces.variable} sticky top-0 z-50 border-b border-ink/15 bg-parchment/95 backdrop-blur-sm`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="Accueil Nedexia"
        >
          <Image src={logo} alt="Nedexia" className="h-6 w-auto sm:h-7" priority />
          <span className="hidden h-3.5 w-px bg-ink/15 lg:block" />
          <span className="hidden font-[family-name:var(--font-fraunces)] text-xs italic text-brass lg:block">
            jardin d&rsquo;entreprises
          </span>
        </Link>

        {/* Desktop — liens de registre */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  active ? "text-rust" : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-rust"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href={authHref}
            className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
          >
            {authLabel}
          </Link>
          <Link
            href="/espace"
            style={NOTCH}
            className="relative inline-flex items-center bg-ink px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-parchment transition-colors before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-rust before:content-[''] hover:bg-[#232e3d]"
          >
            Commencer
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:text-rust md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen(!open)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M4 4l14 14M18 4L4 18" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile — page de registre dépliée */}
      {open && (
        <div className="border-t border-ink/15 bg-parchment md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {links.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-dotted border-ink/20 py-3.5"
                >
                  <span className="w-6 font-[family-name:var(--font-fraunces)] text-xs italic text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[0.78rem] font-semibold uppercase tracking-[0.16em] ${
                      active ? "text-rust" : "text-ink"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
            <Link
              href={authHref}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 py-3.5"
            >
              <span className="w-6" aria-hidden />
              <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                {authLabel}
              </span>
            </Link>
            <div className="pb-4 pt-1">
              <Link
                href="/espace"
                onClick={() => setOpen(false)}
                style={NOTCH}
                className="relative flex items-center justify-center bg-ink px-5 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-parchment before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-rust before:content-['']"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

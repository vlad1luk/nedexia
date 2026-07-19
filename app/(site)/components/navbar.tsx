"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { fraunces } from "../financement/fonts";
import { createClient } from "@/lib/supabase/client";
import logo from "@/public/logo-nedexia.png";

/**
 * Navigation publique : un repère sobre et institutionnel qui laisse la
 * promesse financement prendre toute la place dans le premier écran.
 */

const links = [
  { href: "/financement", label: "Financement" },
  { href: "/eden", label: "Eden" },
  { href: "/score", label: "Score" },
  { href: "/matching", label: "Matching" },
];

const homeLinks = [
  { href: "#diagnostic", label: "Diagnostic" },
  { href: "#ressources", label: "Ressources" },
  { href: "/eden", label: "Eden" },
];

const NOTCH = {
  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
};

function isActive(pathname: string, href: string) {
  if (href.startsWith("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isEden = pathname === "/eden";
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
  const navLinks = isHome ? homeLinks : links;
  const primaryHref = isHome ? "#diagnostic" : "/espace";
  const primaryLabel = isHome ? "Faire le diagnostic" : "Voir mon potentiel";

  return (
    <header
      className={`${fraunces.variable} sticky top-0 z-50 bg-transparent px-3 pt-3 sm:px-5`}
    >
      <nav className={`mx-auto flex h-[4.5rem] max-w-[92rem] items-center justify-between gap-5 rounded-[1.25rem] border px-5 shadow-[0_8px_28px_rgba(27,35,39,0.08)] backdrop-blur-md sm:px-8 lg:px-12 ${isHome ? "border-[#d9dfdc]/90 bg-[#f7f8f6]/90" : isEden ? "border-[#3a378f]/12 bg-white/88 shadow-[0_16px_52px_rgba(58,55,143,0.09)] backdrop-blur-xl" : "border-ink/10 bg-[#f4f1e8]/92"}`}>
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="Accueil Nedexia"
        >
          <Image src={logo} alt="Nedexia" className="h-7 w-auto sm:h-8" priority />
          {!isHome && !isEden ? (
            <>
              <span className="hidden h-3.5 w-px bg-ink/15 lg:block" />
              <span className="hidden font-[family-name:var(--font-fraunces)] text-xs italic text-brass lg:block">financement accompagné</span>
            </>
          ) : null}
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1.5 text-sm font-medium tracking-[-0.02em] transition-colors ${
                  active
                    ? isHome
                      ? "text-[#5966e8]"
                      : isEden
                        ? "text-[#3a378f]"
                        : "text-rust"
                    : isHome
                      ? "text-[#697478] hover:text-[#1b2327]"
                      : isEden
                        ? "text-[#62617d] hover:text-[#282654]"
                        : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 h-px ${isHome ? "bg-[#5966e8]" : isEden ? "bg-[#3a378f]" : "bg-rust"}`}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href={authHref}
            className={`text-sm font-medium tracking-[-0.02em] transition-colors ${isHome ? "text-[#697478] hover:text-[#1b2327]" : isEden ? "text-[#62617d] hover:text-[#282654]" : "text-ink-soft hover:text-ink"}`}
          >
            {authLabel}
          </Link>
          <Link
            href={primaryHref}
            style={isHome || isEden ? undefined : NOTCH}
            className={`relative inline-flex items-center px-4 py-2.5 text-sm font-medium tracking-[-0.02em] transition-all ${isHome ? "border border-[#1b2327] bg-[#1b2327] text-[#f7f8f6] hover:bg-[#5966e8]" : isEden ? "rounded-full border border-[#3a378f] bg-[#3a378f] text-white shadow-[0_8px_28px_rgba(58,55,143,0.16)] hover:-translate-y-0.5 hover:bg-[#2f2c79]" : "bg-ink text-parchment before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-rust before:content-[''] hover:bg-[#232e3d]"}`}
          >
            {primaryLabel}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className={`flex h-10 w-10 items-center justify-center transition-colors md:hidden ${isHome ? "text-[#1b2327] hover:text-[#5966e8]" : isEden ? "text-[#3a378f] hover:text-[#22b9dc]" : "text-ink hover:text-rust"}`}
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

      {open && (
        <div className={`mx-auto mt-2 max-w-[92rem] overflow-hidden rounded-[1.25rem] border shadow-[0_8px_28px_rgba(27,35,39,0.08)] backdrop-blur-xl md:hidden ${isHome ? "border-[#d9dfdc]/90 bg-[#f7f8f6]/95" : isEden ? "border-[#3a378f]/12 bg-white/96" : "border-ink/10 bg-[#f4f1e8]/95"}`}>
          <div className="mx-auto flex max-w-[92rem] flex-col px-5 py-2 sm:px-8 lg:px-12">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-baseline border-b py-4 ${isHome ? "border-[#d9dfdc]" : isEden ? "border-[#3a378f]/10" : "border-dotted border-ink/20"}`}
                >
                  <span
                    className={`text-base font-medium tracking-[-0.02em] ${
                      active
                        ? isHome
                          ? "text-[#5966e8]"
                          : isEden
                          ? "text-[#3a378f]"
                            : "text-rust"
                        : isHome
                          ? "text-[#1b2327]"
                          : isEden
                            ? "text-[#282654]"
                            : "text-ink"
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
              className="flex items-baseline py-4"
            >
              <span className={`text-base font-medium tracking-[-0.02em] ${isHome ? "text-[#697478]" : isEden ? "text-[#62617d]" : "text-ink-soft"}`}>
                {authLabel}
              </span>
            </Link>
            <div className="pb-4 pt-1">
              <Link
                href={primaryHref}
                onClick={() => setOpen(false)}
                style={isHome || isEden ? undefined : NOTCH}
                className={`relative flex items-center justify-center px-5 py-3.5 text-base font-medium tracking-[-0.02em] ${isHome ? "border border-[#1b2327] bg-[#1b2327] text-[#f7f8f6]" : isEden ? "rounded-full border border-[#3a378f] bg-[#3a378f] text-white" : "bg-ink text-parchment before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-rust before:content-['']"}`}
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

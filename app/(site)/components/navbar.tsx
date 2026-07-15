"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import logo from "@/public/logo-nedexia.png";

const links = [
  { href: "/financement", label: "Financement" },
  { href: "/eden", label: "Eden" },
  { href: "/matching", label: "Matching" },
  { href: "/psychologie", label: "Psychologie" },
  { href: "/score", label: "Score" },
];

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
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-navy/8 bg-white/75 px-3 shadow-sm shadow-navy/5 backdrop-blur-xl sm:px-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center rounded-xl px-2 py-1.5 transition-opacity hover:opacity-80"
          aria-label="Accueil Nedexia"
        >
          <Image src={logo} alt="Nedexia" className="h-6 w-auto sm:h-7" priority />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-0.5 rounded-full bg-navy/[0.04] p-1">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white text-navy shadow-sm shadow-navy/10"
                      : "text-foreground/60 hover:text-navy"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="ml-2 flex items-center gap-2">
            <Link
              href={authHref}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-navy/5 hover:text-navy"
            >
              {authLabel}
            </Link>
            <Link
              href="/espace"
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:-translate-y-px hover:bg-navy-deep hover:shadow-lg hover:shadow-navy/25"
            >
              Commencer
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-navy transition-colors hover:bg-navy/5 md:hidden"
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
            strokeWidth="2"
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

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-navy/8 bg-white/95 p-2 shadow-lg shadow-navy/10 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-0.5">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    active
                      ? "bg-navy/5 text-navy"
                      : "text-foreground/75 hover:bg-navy/[0.03] hover:text-navy"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-2 flex flex-col gap-2 border-t border-navy/8 p-2">
            <Link
              href={authHref}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-center text-base font-medium text-foreground/75 transition-colors hover:bg-navy/5 hover:text-navy"
            >
              {authLabel}
            </Link>
            <Link
              href="/espace"
              onClick={() => setOpen(false)}
              className="rounded-full bg-navy px-5 py-3 text-center text-base font-semibold text-white shadow-md shadow-navy/20"
            >
              Commencer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

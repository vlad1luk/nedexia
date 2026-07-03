"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import logo from "@/public/logo-nedexia.png";

const links = [
  { href: "/eden", label: "Eden" },
  { href: "/matching", label: "Matching" },
  { href: "/score", label: "Score" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Accueil Nedexia">
          <Image src={logo} alt="Nedexia" className="h-7 w-auto" priority />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-navy ${
                pathname === link.href ? "text-navy" : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/eden"
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
          >
            Commencer
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen(!open)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M4 4l14 14M18 4L4 18" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-navy/10 bg-white px-4 pb-4 pt-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-base font-medium ${
                pathname === link.href ? "bg-navy/5 text-navy" : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/eden"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-navy px-5 py-2.5 text-center text-base font-semibold text-white"
          >
            Commencer
          </Link>
        </div>
      )}
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";

import logo from "@/public/logo-nedexia.png";

const footerLinks = [
  { href: "/#diagnostic", label: "Diagnostic" },
  { href: "/#ressources", label: "Ressources" },
  { href: "/eden", label: "Eden" },
  { href: "/eden#fondateurs", label: "Fondateurs" },
  { href: "/connexion", label: "Connexion" },
];

export default function Footer() {
  return (
    <footer className="bg-[#171d20] text-[#f7f8f6]">
      <div className="mx-auto max-w-[92rem] px-5 pb-7 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-24">
          <div>
            <Link href="/" aria-label="Accueil Nedexia" className="inline-flex transition-opacity hover:opacity-80">
              <Image src={logo} alt="Nedexia" className="h-8 w-auto brightness-0 invert sm:h-9" />
            </Link>
            <h2 className="mt-16 max-w-3xl text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.065em] sm:text-6xl">
              Rendre les bonnes conversations possibles.
            </h2>
          </div>

          <div className="flex flex-col justify-between gap-14">
            <p className="max-w-xs text-sm leading-relaxed text-[#aeb8b6]">
              Le financement accompagné des PME québécoises.
            </p>
            <div className="flex flex-col items-start gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#f7f8f6]/70 transition-colors hover:text-[#aeb5ff]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-[#f7f8f6]/15 pt-5 text-xs text-[#aeb8b6] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nedexia</p>
          <p>Québec, Canada</p>
        </div>
      </div>
    </footer>
  );
}

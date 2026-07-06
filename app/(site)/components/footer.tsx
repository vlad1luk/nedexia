import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo-nedexia.png";

const links = [
  { href: "/eden", label: "Eden" },
  { href: "/matching", label: "Matching" },
  { href: "/score", label: "Score" },
];

export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Link href="/" aria-label="Accueil Nedexia">
            <Image src={logo} alt="Nedexia" className="h-6 w-auto" />
          </Link>
          <p className="text-sm text-foreground/60">
            Le tuteur de croissance des PME québécoises.
          </p>
        </div>
        <nav className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-navy/5 py-4">
        <p className="text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} Nedexia. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

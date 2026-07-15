import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Lien-bouton « scellé » du système carnet de terrain — coin coupé façon
 * souche de billet, liseré rouille en pied. Même langage que le CTA de
 * /financement, mais en simple lien de navigation (pas d'événement tunnel).
 */
const NOTCH = {
  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
};

type Props = {
  href: string;
  children: ReactNode;
  /** dark = encre sur parchemin (défaut) · light = parchemin sur encre */
  tone?: "dark" | "light";
  className?: string;
};

export function LedgerLink({ href, children, tone = "dark", className }: Props) {
  return (
    <Link
      href={href}
      style={NOTCH}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-semibold uppercase tracking-[0.08em] transition-all",
        "before:absolute before:inset-x-0 before:bottom-0 before:h-[3px] before:bg-rust before:content-['']",
        tone === "dark"
          ? "bg-ink text-parchment hover:bg-[#232e3d]"
          : "bg-parchment text-ink hover:bg-parchment-deep",
        className
      )}
    >
      {children}
    </Link>
  );
}

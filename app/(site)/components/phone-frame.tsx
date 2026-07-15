import Image from "next/image";
import type { StaticImageData } from "next/image";

// Espace réservé pour les captures d'écran de l'application mobile.
// Pour remplacer : importez l'image (ex. `import ecran from "@/public/ecran-accueil.png"`)
// puis passez-la via la prop `src`, ou remplacez le <ScreenPlaceholder /> concerné
// par <Image src={ecran} alt="…" fill className="object-cover" />.
export function ScreenPlaceholder({
  label,
  align = "center",
}: {
  label: string;
  align?: "center" | "top";
}) {
  return (
    <div
      className={`absolute inset-2.5 flex flex-col items-center gap-2.5 rounded-[1.85rem] border-2 border-dashed border-ink/15 bg-parchment px-4 text-center ${
        align === "top" ? "justify-start pt-16" : "justify-center"
      }`}
    >
      <p className="text-sm font-medium leading-snug text-ink/55">{label}</p>
      <p className="text-xs text-ink-soft/60">Capture à venir</p>
    </div>
  );
}

export default function PhoneFrame({
  src,
  alt = "",
  label,
  align = "center",
  className = "",
  children,
}: {
  src?: StaticImageData | string;
  alt?: string;
  label?: string;
  align?: "center" | "top";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-[2.75rem] bg-navy-deep p-2 shadow-2xl shadow-navy/25 ${className}`}>
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.25rem] bg-white">
        {children ??
          (src ? (
            <Image src={src} alt={alt} fill sizes="288px" className="object-cover" />
          ) : (
            <ScreenPlaceholder label={label ?? ""} align={align} />
          ))}
        <div className="pointer-events-none absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-navy-deep" aria-hidden="true" />
      </div>
    </div>
  );
}

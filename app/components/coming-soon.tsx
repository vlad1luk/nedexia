import Link from "next/link";

export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
      </div>
      <div className="relative max-w-xl py-24 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-sun/50 bg-sun/10 px-4 py-1.5 text-sm font-medium text-navy">
          🌱 En pleine croissance
        </p>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground/70">{description}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-navy px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-navy-deep"
        >
          Retour à l’accueil
        </Link>
      </div>
    </section>
  );
}

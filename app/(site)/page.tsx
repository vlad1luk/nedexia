import Link from "next/link";

import HomeDiagnostic from "./components/home-diagnostic";
import HomeLens from "./components/home-lens";
import HomeResources from "./components/home-resources";

const preparationSignals = ["Projet", "Chiffres", "Dossier", "Admissibilité"];

export default function Home() {
  return (
    <div className="bg-[#f7f8f6] text-[#1b2327]">
      <section className="overflow-hidden">
        <div className="mx-auto max-w-[92rem] px-5 pb-12 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12">
          <div className="mx-auto flex max-w-5xl flex-col items-center pb-20 pt-16 text-center sm:pb-24 sm:pt-24">
            <h1 className="max-w-5xl text-balance text-[clamp(3.1rem,7.4vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.085em] text-[#171d20]">
              Rendez votre entreprise <span className="text-[#5966e8]">finançable.</span>
            </h1>
            <p className="mt-9 max-w-2xl text-base leading-relaxed text-[#697478] sm:text-lg">
              Un verdict concret sur les programmes qui vous correspondent, puis un accompagnement pour structurer ce que le dossier doit prouver.
            </p>
            <Link href="#diagnostic" className="group mt-10 inline-flex items-center gap-3 border-b border-[#1b2327] pb-2 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#1b2327]">
              Voir mon potentiel de financement
              <span className="text-base text-[#5966e8] transition-transform duration-500 group-hover:translate-y-1">↓</span>
            </Link>
          </div>

          <HomeLens />
        </div>
      </section>

      <section className="bg-[#1b2327] text-[#f7f8f6]">
        <div className="mx-auto max-w-[92rem] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-20">
            <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              Le bon programme ne suffit pas. Il faut que votre entreprise soit prête à le déposer.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-[#b5bebd]">
              Nedexia relie le financement à la réalité opérationnelle : vos chiffres, votre projet, votre capacité à démontrer l’impact.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap border-y border-[#f7f8f6]/20">
            {preparationSignals.map((signal, index) => (
              <div key={signal} className="flex min-w-[50%] flex-1 items-center gap-4 border-b border-[#f7f8f6]/20 py-5 text-sm text-[#b5bebd] last:border-b-0 sm:min-w-0 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                <span className={cnSignal(index)} />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeDiagnostic />

      <section className="bg-[#e9efff] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-[92rem]">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.19em] text-[#5966e8]">Quand le dossier devient lisible</p>
              <h2 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.065em] text-[#171d20] sm:text-6xl lg:text-7xl">Les bonnes conversations commencent ici.</h2>
            </div>
            <Link href="/eden" className="group inline-flex shrink-0 items-center gap-3 border-b border-[#171d20] pb-2 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#171d20]">
              Comprendre l’accompagnement
              <span className="text-base text-[#5966e8] transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="mt-16 flex flex-col gap-4 border-t border-[#5966e8]/25 pt-5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#5966e8] sm:flex-row sm:justify-between">
            <span>Programmes mieux ciblés</span>
            <span>Dossiers plus défendables</span>
            <span>Accès aux bons partenaires</span>
          </div>
        </div>
      </section>

      <HomeResources />
    </div>
  );
}

function cnSignal(index: number) {
  return `h-2 w-2 shrink-0 rounded-full ${index === 3 ? "bg-[#67b879]" : index === 2 ? "bg-[#8a7cf3]" : "bg-[#5966e8]"}`;
}

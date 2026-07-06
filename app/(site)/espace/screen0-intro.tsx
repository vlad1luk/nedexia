"use client";

import Image from "next/image";
import symbole from "@/public/symbole-eden.png";

type Props = {
  onStart: () => void;
};

export function Screen0Intro({ onStart }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center gap-3">
          <Image src={symbole} alt="" className="h-20 w-auto animate-float-subtle" />
          <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-foreground/40">
            Eden · Diagnostic Nedexia
          </span>
        </div>

        <h1 className="mt-10 text-balance text-center text-3xl font-semibold leading-tight text-navy sm:text-[2.25rem]">
          Mesurez la préparation de votre entreprise{" "}
          <br className="hidden sm:block" />
          en 5 à 7 minutes.
        </h1>

        <p className="mt-5 max-w-xl text-balance text-center text-base text-foreground/75 sm:text-[1.05rem]">
          Bonjour, je suis Eden. Je vais vous poser quelques questions pour
          obtenir une{" "}
          <strong className="font-semibold text-navy">première lecture</strong>{" "}
          de la préparation de votre PME. À la fin, vous recevrez un{" "}
          <strong className="font-semibold text-navy">score indicatif</strong>{" "}
          sur 100, réparti sur 5 dimensions, et une lecture adaptée à votre
          objectif.
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-foreground/55">
          <li className="flex items-center gap-2 rounded-full border border-navy/10 bg-white px-3 py-1.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-leaf" />
            5 à 7 minutes
          </li>
          <li className="flex items-center gap-2 rounded-full border border-navy/10 bg-white px-3 py-1.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-leaf" />
            Gratuit
          </li>
        </ul>

        <button
          type="button"
          onClick={onStart}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
        >
          Commencer le diagnostic
        </button>

        <p className="mt-5 max-w-md text-center text-xs text-foreground/40">
          Test pilote · les questions sont scriptées, vos réponses sont
          conservées pour analyser le parcours et améliorer l&rsquo;outil.
        </p>
      </div>
    </section>
  );
}

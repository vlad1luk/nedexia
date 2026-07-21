"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";

import symbole from "@/public/symbole-eden.png";
import { logos } from "./logos";

const connectors = [
  { name: "Notion", x: 12, y: 22, accent: "#111111" },
  { name: "HubSpot", x: 84, y: 17, accent: "#ff7a59" },
  { name: "QuickBooks", x: 8, y: 76, accent: "#2ca01c" },
  { name: "Stripe", x: 88, y: 72, accent: "#635bff" },
];

const CONNECTOR_MS = 3600;

function EdenObject() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timeout = window.setTimeout(
      () => setActive((current) => (current + 1) % connectors.length),
      CONNECTOR_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [active, reduce]);

  const activeConnector = connectors[active];

  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[30%] blur-[70px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(34,185,220,0.2), rgba(85,81,168,0.11) 48%, transparent 73%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[54%] w-[43%] rounded-[3.5rem] border border-white/75 bg-white/30 shadow-[0_30px_90px_rgba(58,55,143,0.08)] backdrop-blur-md"
        animate={
          reduce
            ? undefined
            : {
                x: ["-54%", "-50%", "-54%"],
                y: ["-46%", "-50%", "-46%"],
                rotate: [-8, -5, -8],
              }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[54%] w-[43%] rounded-[3.5rem] border border-[#3a378f]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.52),rgba(226,239,246,0.34))] shadow-[0_30px_90px_rgba(34,185,220,0.09)] backdrop-blur-lg"
        animate={
          reduce
            ? undefined
            : {
                x: ["-46%", "-50%", "-46%"],
                y: ["-54%", "-50%", "-54%"],
                rotate: [7, 4, 7],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {connectors.map((connector, index) => {
        const logo = logos[connector.name];
        const focused = index === active;

        return (
          <motion.button
            key={connector.name}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Mettre ${connector.name} en avant`}
            className="absolute"
            style={{
              left: `${connector.x}%`,
              top: `${connector.y}%`,
              x: "-50%",
              y: "-50%",
            }}
            initial={reduce ? false : { opacity: 0, scale: 0.72 }}
            animate={{
              opacity: focused ? 1 : 0.62,
              scale: focused ? 1.06 : 0.9,
            }}
            whileHover={{ opacity: 1, scale: 1.04 }}
            transition={{
              opacity: { duration: 0.45 },
              scale: { type: "spring", stiffness: 180, damping: 18 },
            }}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/75 shadow-[0_16px_42px_rgba(48,47,85,0.1)] backdrop-blur-xl sm:h-16 sm:w-16 sm:rounded-[1.35rem]"
              style={{
                boxShadow: focused
                  ? `0 18px 52px ${connector.accent}24, 0 0 0 1px ${connector.accent}22`
                  : "0 16px 42px rgba(48,47,85,0.1)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 sm:h-7 sm:w-7"
                fill={logo.hex}
                aria-hidden
              >
                <path d={logo.path} />
              </svg>
            </span>
            <span className="mt-2 hidden text-[0.7rem] font-medium text-[#65637b] sm:block">
              {connector.name}
            </span>
          </motion.button>
        );
      })}

      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ x: "-50%", y: "-50%" }}
        initial={reduce ? false : { opacity: 0, scale: 0.76 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.15, delay: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2.8rem] border border-white/50 sm:h-48 sm:w-48 sm:rounded-[3.7rem]"
          style={{
            background:
              "radial-gradient(circle at 28% 18%, #8ee5ef, #22b9dc 29%, #514da4 65%, #302d78 100%)",
            boxShadow: `0 38px 95px rgba(58,55,143,0.3), 0 0 100px ${activeConnector.accent}1f, inset 0 1px rgba(255,255,255,0.82)`,
          }}
          animate={reduce ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            aria-hidden
            className="absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent"
            animate={reduce ? undefined : { x: ["0%", "430%"] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          />
          <Image
            src={symbole}
            alt="Eden"
            className="relative w-16 brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.42)] sm:w-20"
            priority
          />
        </motion.div>
        <p className="mt-6 text-center text-2xl font-semibold tracking-[-0.045em] text-[#302d78] sm:text-3xl">
          Eden
        </p>
      </motion.div>
    </div>
  );
}

export default function SystemHero() {
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 55, damping: 24, mass: 0.9 });
  const springY = useSpring(pointerY, { stiffness: 55, damping: 24, mass: 0.9 });
  const objectX = useTransform(springX, [0, 1], reduce ? [0, 0] : [-10, 10]);
  const objectY = useTransform(springY, [0, 1], reduce ? [0, 0] : [-7, 7]);

  return (
    <section
      className="relative -mt-[5.25rem] min-h-svh overflow-hidden bg-[#f7f7fb] text-[#282654]"
      onPointerMove={(event) => {
        if (reduce) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - bounds.left) / bounds.width);
        pointerY.set((event.clientY - bounds.top) / bounds.height);
      }}
      onPointerLeave={() => {
        pointerX.set(0.5);
        pointerY.set(0.5);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(62% 70% at 88% 40%, rgba(34,185,220,0.12), transparent 72%), radial-gradient(48% 58% at 72% 30%, rgba(85,81,168,0.1), transparent 70%), linear-gradient(180deg, #fbfbfd 0%, #f4f5fa 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(58,55,143,0.22),rgba(34,185,220,0.28),transparent)]"
      />

      <div className="relative mx-auto grid min-h-svh max-w-[96rem] items-center gap-12 px-5 pb-16 pt-[9.5rem] sm:px-8 sm:pt-[10.5rem] lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:px-12 lg:pb-20 lg:pt-[11rem]">
        <div className="relative z-10">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 34, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block bg-[linear-gradient(105deg,#302d78_8%,#5551a8_50%,#22b9dc_100%)] bg-clip-text text-[clamp(5.5rem,10vw,10.5rem)] font-semibold leading-[0.76] tracking-[-0.085em] text-transparent">
              Eden
            </span>
            <span className="mt-9 block max-w-[47rem] text-balance text-[clamp(3rem,5.4vw,6.2rem)] font-semibold leading-[0.88] tracking-[-0.072em] text-[#282654] sm:mt-12">
              Votre entreprise,
              <br />
              enfin lisible.
            </span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: reduce ? 0 : 0.22 }}
            className="mt-8 max-w-xl text-balance text-base leading-[1.65] tracking-[-0.025em] text-[#62617d] sm:text-lg"
          >
            Eden relie vos finances, vos ventes et vos opérations dans une vue
            claire de l’entreprise.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: reduce ? 0 : 0.34 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <Link
              href="/financement"
              className="group relative isolate overflow-hidden rounded-full bg-[#3a378f] px-7 py-4 text-sm font-semibold tracking-[-0.02em] text-white shadow-[0_16px_46px_rgba(58,55,143,0.22)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#2f2c79]"
            >
              <span className="absolute inset-0 -z-10 translate-x-[-110%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.65),transparent)] transition-transform duration-700 group-hover:translate-x-[110%]" />
              Connecter mon entreprise
              <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
            <a
              href="#croissance"
              className="group flex items-center gap-2 py-3 text-sm font-medium text-[#62617d] transition-colors hover:text-[#3a378f]"
            >
              Découvrir Eden
              <span className="text-[#22b9dc] transition-transform duration-300 group-hover:translate-y-1">
                ↓
              </span>
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: reduce ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[29rem] sm:h-[37rem] lg:h-[44rem]"
          style={{ x: objectX, y: objectY }}
        >
          <EdenObject />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useState } from "react";

import symbole from "@/public/symbole-eden.png";
import { logos } from "./logos";
import { eden } from "./palette";

type Tool = {
  name: string;
  x: number;
  y: number;
  far?: boolean;
  hideMobile?: boolean;
};

type Insight = {
  statement: string;
  accent: string;
  focus: string[];
};

const tools: Tool[] = [
  { name: "QuickBooks", x: 10, y: 64 },
  { name: "Notion", x: 27, y: 18 },
  { name: "HubSpot", x: 73, y: 17 },
  { name: "Salesforce", x: 91, y: 39, far: true, hideMobile: true },
  { name: "Stripe", x: 88, y: 69 },
  { name: "Mailchimp", x: 68, y: 90, far: true, hideMobile: true },
  { name: "Shopify", x: 47, y: 88 },
  { name: "Outlook", x: 18, y: 86 },
  { name: "Google Calendar", x: 7, y: 34, far: true },
  { name: "Zoho", x: 47, y: 6, far: true, hideMobile: true },
];

const insights: Insight[] = [
  {
    statement: "Les revenus avancent. L’acquisition, elle, ralentit.",
    accent: eden.sun,
    focus: ["Stripe", "HubSpot"],
  },
  {
    statement: "Le pipeline se remplit plus vite que la capacité.",
    accent: eden.coral,
    focus: ["HubSpot", "Notion"],
  },
  {
    statement: "La structure ouvre maintenant de nouvelles options de financement.",
    accent: eden.sky,
    focus: ["QuickBooks", "Stripe"],
  },
  {
    statement: "La trésorerie dessine une fenêtre d’expansion.",
    accent: eden.teal,
    focus: ["QuickBooks", "Shopify"],
  },
  {
    statement: "Les prochaines décisions apparaissent dans le bon ordre.",
    accent: eden.leaf,
    focus: ["Notion", "Outlook"],
  },
];

const INSIGHT_MS = 7200;
const CORE = { x: 50, y: 52 };

const insightByTool = new Map<string, number>();
insights.forEach((insight, index) => {
  insight.focus.forEach((name) => {
    if (!insightByTool.has(name)) insightByTool.set(name, index);
  });
});

function flowPath(x1: number, y1: number, x2: number, y2: number, bend: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const coordinate = (value: number) => Number(value.toFixed(3)).toString();
  const controlX = mx + (-dy / length) * bend;
  const controlY = my + (dx / length) * bend;

  return `M ${coordinate(x1)} ${coordinate(y1)} Q ${coordinate(controlX)} ${coordinate(controlY)} ${coordinate(x2)} ${coordinate(y2)}`;
}

function SignalField({
  active,
  onFocus,
}: {
  active: number;
  onFocus: (index: number) => void;
}) {
  const reduce = useReducedMotion();
  const insight = insights[active];
  const shown = useMemo(
    () => tools,
    [],
  );
  const width = 1000;
  const height = 760;
  const coreX = (CORE.x / 100) * width;
  const coreY = (CORE.y / 100) * height;

  return (
    <div className="absolute inset-0">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,185,220,0.13), rgba(58,55,143,0.08) 48%, transparent 72%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3a378f]/10"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22b9dc] shadow-[0_0_22px_#22b9dc]" />
        <span className="absolute bottom-[12%] right-[7%] h-1 w-1 rounded-full bg-[#3a378f] shadow-[0_0_18px_#3a378f]" />
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#3a378f]/[0.07]"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id="eden-signal-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="eden-core-field">
            <stop offset="0" stopColor={eden.teal} stopOpacity="0.24" />
            <stop offset="0.55" stopColor={eden.violet} stopOpacity="0.08" />
            <stop offset="1" stopColor={eden.ground} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={coreX} cy={coreY} r="245" fill="url(#eden-core-field)" />

        {shown.map((tool, index) => {
          const x = (tool.x / 100) * width;
          const y = (tool.y / 100) * height;
          const distance = Math.hypot(coreX - x, coreY - y);
          const bend = (index % 2 === 0 ? -1 : 1) * Math.min(80, distance * 0.18);
          const path = flowPath(x, y, coreX, coreY, bend);
          const focused = insight.focus.includes(tool.name);
          const color = logos[tool.name].hex;
          const duration = 4.8 + index * 0.42;

          return (
            <g key={tool.name}>
              <motion.path
                id={`eden-flow-${index}`}
                d={path}
                stroke={focused ? insight.accent : color}
                strokeWidth={focused ? 1.7 : 0.75}
                strokeOpacity={focused ? 0.6 : 0.14}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: reduce ? 0 : 0.25 + index * 0.09 }}
              />
              {focused ? (
                <motion.path
                  d={path}
                  stroke={insight.accent}
                  strokeWidth="1"
                  strokeDasharray="3 12"
                  strokeOpacity="0.85"
                  animate={reduce ? undefined : { strokeDashoffset: [0, -90] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
              ) : null}
              {!reduce ? (
                <circle
                  r={focused ? 3.4 : 2}
                  fill={focused ? insight.accent : color}
                  filter="url(#eden-signal-glow)"
                  opacity={focused ? 0.95 : 0.55}
                >
                  <animateMotion
                    dur={`${duration}s`}
                    begin={`${0.7 + index * 0.28}s`}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#eden-flow-${index}`} />
                  </animateMotion>
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>

      {shown.map((tool, index) => {
        const logo = logos[tool.name];
        const focused = insight.focus.includes(tool.name);
        const target = insightByTool.get(tool.name);

        return (
          <motion.button
            key={tool.name}
            type="button"
            onClick={target === undefined ? undefined : () => onFocus(target)}
            aria-label={
              target === undefined
                ? tool.name
                : `Afficher la lecture associée à ${tool.name}`
            }
            className={`group absolute -translate-x-1/2 -translate-y-1/2 text-left ${
              tool.hideMobile ? "hidden sm:block" : "block"
            }`}
            style={{ left: `${tool.x}%`, top: `${tool.y}%` }}
            initial={reduce ? false : { opacity: 0, scale: 0.55, filter: "blur(8px)" }}
            animate={{
              opacity: tool.far && !focused ? 0.58 : 1,
              scale: tool.far ? 0.82 : focused ? 1.08 : 1,
              filter: "blur(0px)",
              y: reduce ? 0 : [0, index % 2 ? -6 : 6, 0],
            }}
            whileHover={{ scale: tool.far ? 0.9 : 1.08, opacity: 1 }}
            transition={{
              opacity: { duration: 0.65, delay: reduce ? 0 : 0.3 + index * 0.08 },
              scale: { type: "spring", stiffness: 220, damping: 18 },
              filter: { duration: 0.65, delay: reduce ? 0 : 0.3 + index * 0.08 },
              y: { duration: 6 + index * 0.35, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <span
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl sm:h-14 sm:w-14"
              style={{
                borderColor: focused ? `${insight.accent}aa` : "rgba(58,55,143,0.14)",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,249,253,0.94))",
                boxShadow: focused
                  ? `0 0 0 1px ${insight.accent}26, 0 14px 40px ${insight.accent}24`
                  : "0 12px 32px rgba(45,43,92,0.1)",
              }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill={logo.hex} aria-hidden>
                <path d={logo.path} />
              </svg>
              {focused ? (
                <motion.span
                  aria-hidden
                  className="absolute -inset-2 rounded-[1.2rem] border"
                  style={{ borderColor: insight.accent }}
                  animate={reduce ? undefined : { scale: [0.94, 1.16], opacity: [0.7, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              ) : null}
            </span>
            <span className="mt-2 hidden whitespace-nowrap text-[0.68rem] font-medium tracking-[-0.01em] text-[#676681] sm:block">
              {tool.name}
            </span>
          </motion.button>
        );
      })}

      <motion.div
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2"
        initial={reduce ? false : { opacity: 0, scale: 0.55 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#22b9dc]/20"
          animate={reduce ? undefined : { rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity } }}
        />
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#3a378f]/25"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 sm:h-28 sm:w-28"
          style={{
            background:
              "radial-gradient(circle at 30% 22%, #7ad8eb, #22b9dc 30%, #47439d 64%, #302d78 100%)",
            boxShadow:
              "0 22px 60px rgba(58,55,143,0.22), 0 0 90px rgba(34,185,220,0.16), inset 0 1px rgba(255,255,255,0.72)",
          }}
          animate={reduce ? undefined : { y: [0, -7, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={symbole}
            alt="Eden"
            className="w-10 brightness-0 invert drop-shadow-[0_0_16px_rgba(255,255,255,0.45)] sm:w-12"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SystemHero() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 60, damping: 24, mass: 0.9 });
  const springY = useSpring(pointerY, { stiffness: 60, damping: 24, mass: 0.9 });
  const fieldX = useTransform(springX, [0, 1], reduce ? [0, 0] : [-12, 12]);
  const fieldY = useTransform(springY, [0, 1], reduce ? [0, 0] : [-8, 8]);
  const auraX = useTransform(springX, [0, 1], reduce ? [0, 0] : [12, -12]);
  const auraY = useTransform(springY, [0, 1], reduce ? [0, 0] : [8, -8]);
  const spotX = useMotionValue(-500);
  const spotY = useMotionValue(-500);
  const smoothSpotX = useSpring(spotX, { stiffness: 90, damping: 24 });
  const smoothSpotY = useSpring(spotY, { stiffness: 90, damping: 24 });
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${smoothSpotX}px ${smoothSpotY}px, rgba(34,185,220,0.12), transparent 72%)`;

  useEffect(() => {
    if (reduce) return;
    const timeout = window.setTimeout(
      () => setActive((current) => (current + 1) % insights.length),
      INSIGHT_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [active, reduce]);

  const insight = insights[active];

  return (
    <section
      className="relative -mt-[5.25rem] overflow-hidden bg-[#f5f5fa] text-[#282654]"
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        pointerX.set(x);
        pointerY.set(y);
        spotX.set(event.clientX - rect.left);
        spotY.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        pointerX.set(0.5);
        pointerY.set(0.5);
        spotX.set(-500);
        spotY.set(-500);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(64% 48% at 78% 28%, rgba(58,55,143,0.1), transparent 72%), radial-gradient(46% 54% at 7% 52%, rgba(34,185,220,0.1), transparent 74%), linear-gradient(180deg, #fbfbfd 0%, #f5f5fa 66%, #eef3f8 100%)",
        }}
      />
      <motion.div
        aria-hidden
        style={{ x: auraX, y: auraY }}
        className="pointer-events-none absolute -right-[20rem] top-[-16rem] h-[58rem] w-[58rem] rounded-full opacity-55 blur-3xl"
      >
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_120deg,rgba(58,55,143,0.14),rgba(34,185,220,0.1),rgba(58,55,143,0.05),rgba(58,55,143,0.14))]" />
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(58,55,143,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(58,55,143,0.045)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: spotlight }}
      />
      <div className="relative mx-auto max-w-[96rem] px-5 pb-20 pt-[9rem] sm:px-8 sm:pt-[10.5rem] lg:px-12 lg:pb-28 lg:pt-[12rem]">
        <div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 38, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[86rem] text-balance text-[clamp(3.15rem,6.9vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.078em] text-[#282654]"
          >
            Vos outils travaillent ensemble.
            <br />
            <span className="text-[#3a378f]">Votre information</span>
            <br />
            <span className="text-[#3a378f]">devrait en faire autant.</span>
          </motion.h1>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.24 }}
            className="mt-10 grid gap-7 border-t border-[#3a378f]/15 pt-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16"
          >
            <p className="max-w-2xl text-balance text-lg leading-[1.55] tracking-[-0.025em] text-[#62617d] lg:text-xl">
              Eden relie les outils déjà au cœur de votre entreprise et remet
              leurs informations dans une lecture commune.
            </p>
            <div className="flex flex-wrap items-center gap-5 lg:justify-end">
              <Link
                href="/financement"
                className="group relative isolate overflow-hidden rounded-full bg-[#3a378f] px-7 py-4 text-sm font-semibold tracking-[-0.02em] text-white shadow-[0_14px_42px_rgba(58,55,143,0.2)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#2f2c79]"
              >
                <span className="absolute inset-0 -z-10 translate-x-[-110%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.65),transparent)] transition-transform duration-700 group-hover:translate-x-[110%]" />
                Connecter mon entreprise
                <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </Link>
              <a
                href="#croissance"
                className="group flex items-center gap-3 py-3 text-sm font-medium text-[#62617d] transition-colors hover:text-[#3a378f]"
              >
                Voir comment Eden agit
                <span className="text-[#22b9dc] transition-transform duration-300 group-hover:translate-y-1">↓</span>
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 42, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative -mx-5 mt-14 h-[40rem] overflow-hidden border-y border-[#3a378f]/15 bg-transparent sm:-mx-8 sm:h-[44rem] lg:mx-0 lg:mt-20 lg:h-[46rem]"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-px bg-[linear-gradient(90deg,transparent,#22b9dc_38%,#3a378f_70%,transparent)] opacity-70" />
          <div aria-hidden className="absolute inset-y-0 left-[7%] z-20 w-px bg-[#3a378f]/[0.055]" />
          <div aria-hidden className="absolute inset-y-0 right-[7%] z-20 w-px bg-[#3a378f]/[0.055]" />
          <motion.div style={{ x: fieldX, y: fieldY }} className="absolute inset-0 z-10">
            <SignalField active={active} onFocus={setActive} />
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 z-30 bg-[linear-gradient(to_top,rgba(245,245,250,0.99)_12%,rgba(245,245,250,0.9)_58%,transparent)] px-5 pb-6 pt-32 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10 lg:pt-40">
            <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-3xl text-balance text-2xl font-medium leading-[1.02] tracking-[-0.05em] text-[#282654] sm:text-4xl lg:text-5xl"
                >
                  {insight.statement}
                </motion.p>
              </AnimatePresence>

              <div className="flex items-center gap-3" role="tablist" aria-label="Lectures Eden">
                {insights.map((item, index) => (
                  <button
                    key={item.statement}
                    type="button"
                    role="tab"
                    aria-selected={index === active}
                    aria-label={`Lecture ${index + 1}`}
                    onClick={() => setActive(index)}
                    className={`relative h-12 flex-1 border-t pt-3 text-left text-xs font-medium transition-colors ${
                      index === active
                        ? "border-[#3a378f] text-[#3a378f]"
                        : "border-[#3a378f]/15 text-[#9290a7] hover:border-[#3a378f]/35 hover:text-[#62617d]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                    {index === active ? (
                      <motion.span
                        key={`insight-${active}`}
                        className="absolute -top-px left-0 h-px"
                        style={{ background: item.accent }}
                        initial={{ width: reduce ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: reduce ? 0 : INSIGHT_MS / 1000, ease: "linear" }}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,185,220,0.32),rgba(58,55,143,0.36),transparent)]" />
    </section>
  );
}

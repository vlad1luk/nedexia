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
import { useEffect, useRef, useState } from "react";

import symbole from "@/public/symbole-eden.png";
import { logos } from "./logos";
import { eden } from "./palette";

/**
 * Héro « constellation » — Eden est le centre de gravité de la scène.
 *
 * Le noyau trône au centre, en grand. Autour, les dix outils de
 * l'entreprise gravitent en planètes : vraies pastilles de marque
 * (glyphes officiels teintés), reliées au noyau par des flux courbes où
 * circulent les particules de données (SMIL — hors thread principal).
 *
 * Deux temps :
 * 1. L'éveil (≈3 s, une fois) : les planètes s'accrochent une à une —
 *    la barre d'état compte les connexions — puis le noyau s'allume
 *    dans une onde de choc et le titre émerge mot à mot.
 * 2. Le régime vivant : satellites sur les orbites, traces de calcul
 *    sous le noyau, micro-lectures sous les outils qu'un signal lit.
 *    À chaque signal, une impulsion lumineuse PART des outils sources
 *    et remonte les flux jusqu'au noyau : la détection a une cause
 *    visible. Chaque planète est cliquable (elle ramène à son signal)
 *    et révèle au survol ce qu'Eden y lit. Un projecteur discret suit
 *    le curseur dans la trame de fond, en parallaxe multicouche.
 */

type Tool = {
  name: string;
  role: string;
  /** Ce qu'Eden lit dans cet outil — révélé au survol. */
  read: string;
  /** Position % — scène large (desktop, pleine section). */
  x: number;
  y: number;
  /** Position % — scène compacte (mobile, bloc carré). */
  cx: number;
  cy: number;
  /** Couche lointaine : plus petit, plus sombre. */
  far?: boolean;
  /** Eden renvoie aussi du travail vers cet outil (particules retour). */
  out?: boolean;
  hideCompact?: boolean;
};

const tools: Tool[] = [
  { name: "QuickBooks", role: "Comptabilité", read: "214 transactions rapprochées", x: 14, y: 58, cx: 13, cy: 26 },
  { name: "Notion", role: "Opérations", read: "12 processus suivis", x: 22, y: 30, cx: 50, cy: 8, out: true },
  { name: "HubSpot", role: "Pipeline", read: "24 occasions actives", x: 79, y: 30, cx: 87, cy: 26 },
  { name: "Salesforce", role: "CRM", read: "pipeline synchronisé", x: 91, y: 17, cx: 93, cy: 55, far: true },
  { name: "Stripe", role: "Paiements", read: "encaissements en direct", x: 87, y: 58, cx: 81, cy: 80 },
  { name: "Mailchimp", role: "Marketing", read: "42 % d’ouverture", x: 60, y: 86, cx: 0, cy: 0, far: true, hideCompact: true },
  { name: "Shopify", role: "Ventes en ligne", read: "commandes et retours lus", x: 73, y: 77, cx: 50, cy: 88 },
  { name: "Outlook", role: "Courriels", read: "relances suivies", x: 21, y: 73, cx: 19, cy: 80, out: true },
  { name: "Google Calendar", role: "Agenda", read: "charge d’équipe projetée", x: 8, y: 18, cx: 7, cy: 55, far: true },
  { name: "Zoho", role: "Facturation", read: "factures croisées", x: 4, y: 40, cx: 0, cy: 0, far: true, hideCompact: true },
];

type Insight = {
  eyebrow: string;
  statement: string;
  detail: string;
  accent: string;
  focus: string[];
  /** Micro-lecture affichée sous chaque outil source (même ordre que focus). */
  readouts: string[];
  /** Traces de calcul qui défilent sous le noyau pendant ce signal. */
  traces: string[];
};

const insights: Insight[] = [
  {
    eyebrow: "Croissance",
    statement: "Votre croissance ralentit ici.",
    detail:
      "Les revenus tiennent, mais l’acquisition plafonne depuis onze semaines. Eden l’a vu au croisement de Stripe et de HubSpot — pas dans un rapport de fin de mois.",
    accent: eden.sun,
    focus: ["Stripe", "HubSpot"],
    readouts: ["encaissements · +0,4 %", "acquisition · plateau 11 sem."],
    traces: [
      "corrélation stripe × hubspot · 0,86",
      "11 semaines analysées",
      "hypothèse confirmée 2 fois",
    ],
  },
  {
    eyebrow: "Capacité",
    statement: "Le pipeline est solide. La capacité devient le risque.",
    detail:
      "Sept ententes avancent plus vite que la planification d’équipe. Eden mesure l’écart et le signale avant qu’il ne devienne un retard de livraison.",
    accent: eden.coral,
    focus: ["HubSpot", "Notion"],
    readouts: ["7 ententes en accélération", "charge d’équipe · 87 %"],
    traces: [
      "vélocité pipeline vs capacité",
      "écart projeté · 6 semaines",
      "seuil critique estimé",
    ],
  },
  {
    eyebrow: "Financement",
    statement: "Trois programmes que votre entreprise ne voit pas encore.",
    detail:
      "La structure de vos revenus et six mois de trésorerie stable vous rendent admissible. Aucun de vos outils ne le savait — aucun ne regardait l’ensemble.",
    accent: eden.sky,
    focus: ["QuickBooks", "Stripe"],
    readouts: ["6 mois de trésorerie stable", "revenus récurrents · 74 %"],
    traces: [
      "2 741 programmes filtrés",
      "3 correspondances fortes",
      "fenêtres de dépôt vérifiées",
    ],
  },
  {
    eyebrow: "Trésorerie",
    statement: "Une expansion est probablement possible avant décembre.",
    detail:
      "Au rythme actuel des encaissements, un investissement reste absorbable dès octobre. La fenêtre est chiffrée, datée — et surveillée en continu.",
    accent: eden.teal,
    focus: ["QuickBooks", "Shopify"],
    readouts: ["212 500 $ disponibles", "saisonnalité intégrée"],
    traces: [
      "encaissements modélisés · 90 j",
      "marge d’absorption calculée",
      "fenêtre : octobre",
    ],
  },
  {
    eyebrow: "Score de préparation",
    statement: "62 → 74, si trois actions sont complétées.",
    detail:
      "Eden les a déjà découpées et attribuées. Le Score monte quand les preuves sont prêtes — et chaque point ouvre des portes réelles.",
    accent: eden.leaf,
    focus: ["Notion", "Outlook"],
    readouts: ["3 tâches découpées", "2 preuves déjà prêtes"],
    traces: [
      "12 preuves cartographiées",
      "3 actions à fort levier",
      "gain estimé · +12 points",
    ],
  },
];

/** Premier signal qui lit chaque outil — pour le clic sur une planète. */
const insightByTool = new Map<string, number>();
insights.forEach((ins, i) => {
  ins.focus.forEach((name) => {
    if (!insightByTool.has(name)) insightByTool.set(name, i);
  });
});

const INSIGHT_MS = 6800;
const BOOT_MS = 3050;
const CORE = { x: 50, y: 60 };
const CORE_COMPACT = { x: 50, y: 46 };
const TITLE_WORDS = ["Votre", "entreprise", "est", "enfin", "visible."];

type Phase = "boot" | "live";

const pos = (t: Tool, compact: boolean) =>
  compact ? { x: t.cx, y: t.cy } : { x: t.x, y: t.y };

/** Courbe quadratique planète → noyau, bombée perpendiculairement au trajet. */
function flowPath(x1: number, y1: number, x2: number, y2: number, bend: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  return `M ${x1} ${y1} Q ${mx + (-dy / len) * bend} ${my + (dx / len) * bend} ${x2} ${y2}`;
}

function SystemCanvas({
  idp,
  compact,
  active,
  phase,
  onFocus,
}: {
  idp: string;
  compact: boolean;
  active: number;
  phase: Phase;
  onFocus: (index: number) => void;
}) {
  const reduce = useReducedMotion();
  const live = phase === "live";
  const W = 1000;
  const H = compact ? 1040 : 620;
  const core = compact ? CORE_COMPACT : CORE;
  const kx = (core.x / 100) * W;
  const ky = (core.y / 100) * H;
  const ins = insights[active];
  const shown = tools.filter((t) => !(compact && t.hideCompact));
  const primary = shown.find((t) => t.name === ins.focus[0]) ?? shown[0];
  const pp = pos(primary, compact);
  const r1 = compact ? 190 : 150;
  const r2 = compact ? 290 : 238;
  /** Délai d'accrochage pendant l'éveil, par index d'outil. */
  const bd = (i: number) => 0.4 + i * 0.22;

  /* Traces de calcul sous le noyau. */
  const [trace, setTrace] = useState(0);
  useEffect(() => {
    setTrace(0);
    if (reduce || !live) return;
    const t = window.setInterval(() => setTrace((x) => x + 1), 2100);
    return () => window.clearInterval(t);
  }, [active, live, reduce]);

  /* Impulsions de détection : déclenchées à chaque changement de signal. */
  const pulseM = useRef<Record<number, SVGAnimationElement | null>>({});
  const pulseO = useRef<Record<number, SVGAnimationElement | null>>({});
  useEffect(() => {
    if (reduce || !live) return;
    const focused = insights[active].focus;
    const idxs = shown
      .map((t, i) => (focused.includes(t.name) ? i : -1))
      .filter((i) => i >= 0);
    const timers = idxs.map((toolIndex, j) =>
      window.setTimeout(() => {
        pulseM.current[toolIndex]?.beginElement();
        pulseO.current[toolIndex]?.beginElement();
      }, 160 + j * 150),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, live, reduce]);

  return (
    <div className="absolute inset-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter id={`${idp}-glow`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbites lentes + satellites autour du noyau */}
        <motion.circle
          cx={kx}
          cy={ky}
          r={r1}
          stroke={eden.text}
          strokeOpacity="0.07"
          strokeDasharray="1 11"
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: 360 }}
          transition={{
            opacity: { duration: 1, delay: reduce ? 0 : 1.6 },
            rotate: { duration: 46, repeat: Infinity, ease: "linear" },
          }}
          style={{ transformOrigin: `${kx}px ${ky}px` }}
        />
        <motion.circle
          cx={kx}
          cy={ky}
          r={r2}
          stroke={eden.text}
          strokeOpacity="0.045"
          strokeDasharray="1 15"
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: -360 }}
          transition={{
            opacity: { duration: 1, delay: reduce ? 0 : 1.8 },
            rotate: { duration: 72, repeat: Infinity, ease: "linear" },
          }}
          style={{ transformOrigin: `${kx}px ${ky}px` }}
        />
        {!reduce ? (
          <>
            <g opacity="0.55">
              <circle cx={kx + r1} cy={ky} r="2" fill={eden.soft} />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${kx} ${ky}`}
                to={`360 ${kx} ${ky}`}
                dur="46s"
                repeatCount="indefinite"
              />
            </g>
            <g opacity="0.35">
              <circle cx={kx - r2} cy={ky} r="1.6" fill={eden.soft} />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`360 ${kx} ${ky}`}
                to={`0 ${kx} ${ky}`}
                dur="72s"
                repeatCount="indefinite"
              />
            </g>
          </>
        ) : null}

        {shown.map((t, i) => {
          const p = pos(t, compact);
          const x = (p.x / 100) * W;
          const y = (p.y / 100) * H;
          const dist = Math.hypot(kx - x, ky - y);
          const bend = (i % 2 === 0 ? -1 : 1) * Math.min(90, dist * 0.22);
          const d = flowPath(x, y, kx, ky, bend);
          const focused = live && ins.focus.includes(t.name);
          const brand = logos[t.name].hex;
          const dur = 4.6 + i * 0.55;
          const begin = 2.2 + i * 0.8;
          return (
            <g key={t.name}>
              {/* Le flux se trace pendant l'éveil */}
              <motion.path
                id={`${idp}-f-${i}`}
                d={d}
                stroke={brand}
                strokeWidth="1"
                initial={reduce ? false : { pathLength: 0, strokeOpacity: 0 }}
                animate={{ pathLength: 1, strokeOpacity: focused ? 0.38 : 0.13 }}
                transition={{
                  pathLength: { duration: 0.9, delay: reduce ? 0 : bd(i), ease: "easeOut" },
                  strokeOpacity: live
                    ? { duration: 0.5 }
                    : { duration: 0.7, delay: reduce ? 0 : bd(i) },
                }}
              />
              {focused ? (
                <motion.path
                  d={d}
                  stroke={ins.accent}
                  strokeWidth="1.3"
                  strokeOpacity="0.55"
                  strokeDasharray="5 9"
                  animate={reduce ? undefined : { strokeDashoffset: [0, -56] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
              ) : null}
              {/* Particules entrantes : les données remontent vers le noyau */}
              {!reduce ? (
                <circle r={focused ? 3 : 2.3} fill={brand} filter={`url(#${idp}-glow)`} opacity="0">
                  <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite">
                    <mpath href={`#${idp}-f-${i}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.9;0"
                    keyTimes="0;0.12;0.82;1"
                    dur={`${dur}s`}
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
              {/* Écho traînant derrière la particule (couche proche seulement) */}
              {!reduce && !t.far ? (
                <circle r="1.4" fill={brand} opacity="0">
                  <animateMotion
                    dur={`${dur}s`}
                    begin={`${begin + 0.22}s`}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#${idp}-f-${i}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;0.4;0.4;0"
                    keyTimes="0;0.12;0.82;1"
                    dur={`${dur}s`}
                    begin={`${begin + 0.22}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
              {/* Retour : Eden renvoie du travail organisé vers l'outil */}
              {!reduce && t.out ? (
                <circle r="2.3" fill={eden.leaf} filter={`url(#${idp}-glow)`} opacity="0">
                  <animateMotion
                    dur={`${dur + 1.2}s`}
                    begin={`${begin + 2.1}s`}
                    repeatCount="indefinite"
                    keyPoints="1;0"
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#${idp}-f-${i}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;0.85;0.85;0"
                    keyTimes="0;0.14;0.8;1"
                    dur={`${dur + 1.2}s`}
                    begin={`${begin + 2.1}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
              {/* Impulsion de détection : part de la planète, remonte au noyau */}
              {!reduce ? (
                <circle r="3.6" fill={ins.accent} filter={`url(#${idp}-glow)`} opacity="0">
                  <animateMotion
                    ref={(el) => {
                      pulseM.current[i] = el as SVGAnimationElement | null;
                    }}
                    begin="indefinite"
                    dur="1.05s"
                    calcMode="spline"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    keySplines="0.4 0 0.6 1"
                  >
                    <mpath href={`#${idp}-f-${i}`} />
                  </animateMotion>
                  <animate
                    ref={(el) => {
                      pulseO.current[i] = el as SVGAnimationElement | null;
                    }}
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.08;0.85;1"
                    dur="1.05s"
                    begin="indefinite"
                  />
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Les planètes : pastilles de marque, cliquables, lisibles au survol */}
      {shown.map((t, i) => {
        const p = pos(t, compact);
        const focused = live && ins.focus.includes(t.name);
        const readoutIndex = ins.focus.indexOf(t.name);
        const target = insightByTool.get(t.name);
        const clickable = target !== undefined;
        const logo = logos[t.name];
        return (
          <div
            key={t.name}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${
              clickable ? "pointer-events-auto cursor-pointer" : "pointer-events-auto"
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onClick={clickable ? () => onFocus(target) : undefined}
            role={clickable ? "button" : undefined}
            aria-label={clickable ? `Voir le signal lié à ${t.name}` : undefined}
          >
            {/* Flottement organique */}
            <motion.div
              animate={reduce ? undefined : { y: [0, i % 2 ? -7 : 7, 0] }}
              transition={{ duration: 5.6 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
            >
              {/* Accrochage pendant l'éveil */}
              <motion.div
                className={`group flex flex-col items-center ${t.far ? "scale-[0.78]" : ""}`}
                initial={reduce ? false : { opacity: 0, scale: 0.5, filter: "blur(5px)" }}
                animate={{
                  opacity: focused ? 1 : t.far ? 0.5 : 0.85,
                  scale: t.far ? 0.78 : 1,
                  filter: "blur(0px)",
                }}
                whileHover={{ opacity: 1, scale: t.far ? 0.86 : 1.06 }}
                transition={{
                  opacity: { duration: 0.5, delay: live ? 0 : reduce ? 0 : bd(i) },
                  scale: { type: "spring", stiffness: 260, damping: 20, delay: live ? 0 : reduce ? 0 : bd(i) },
                  filter: { duration: 0.5, delay: live ? 0 : reduce ? 0 : bd(i) },
                }}
              >
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-500 sm:h-14 sm:w-14"
                  style={{
                    borderColor: focused ? ins.accent : "rgba(238,240,255,0.14)",
                    background:
                      "radial-gradient(circle at 35% 30%, rgba(238,240,255,0.09), rgba(13,15,46,0.92) 62%, rgba(10,12,38,0.96))",
                    boxShadow: focused
                      ? `0 0 30px ${ins.accent}59, inset 0 0 16px rgba(238,240,255,0.05)`
                      : `0 0 18px ${logo.hex}30, inset 0 0 14px rgba(238,240,255,0.03)`,
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill={logo.hex} aria-hidden>
                    <path d={logo.path} />
                  </svg>
                  {focused && !reduce ? (
                    <motion.span
                      className="absolute inset-0 rounded-full border"
                      style={{ borderColor: ins.accent }}
                      animate={{ scale: [1, 1.9], opacity: [0.8, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                  ) : null}
                </span>

                <span className="mt-2 block whitespace-nowrap text-center">
                  <span
                    className={`block text-[0.66rem] font-medium tracking-[-0.01em] sm:text-[0.78rem] ${
                      focused ? "text-[#eef0ff]" : "text-[#c9cdea]"
                    }`}
                  >
                    {t.name}
                  </span>
                  {/* Rôle au repos · lecture d'Eden au survol */}
                  <span className="relative block h-3.5">
                    <span className="absolute inset-x-0 top-0 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#565c8c] transition-opacity duration-300 group-hover:opacity-0">
                      {t.role}
                    </span>
                    <span className="absolute inset-x-0 top-0 font-mono text-[0.5rem] lowercase tracking-[0.08em] text-[#8a91c4] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {t.read}
                    </span>
                  </span>
                  {/* Micro-lecture : ce que le signal actif lit ici, maintenant */}
                  <AnimatePresence>
                    {focused && readoutIndex >= 0 ? (
                      <motion.span
                        key={`${active}-readout`}
                        className="block overflow-hidden font-mono text-[0.52rem] tracking-[0.08em]"
                        style={{ color: ins.accent }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, delay: 0.9 }}
                      >
                        {ins.readouts[readoutIndex]}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </motion.div>
            </motion.div>
          </div>
        );
      })}

      {/* Réticule d'observation — encadre la source du signal actif */}
      <motion.div
        className="pointer-events-none absolute h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-[3.2rem]"
        animate={{ left: `${pp.x}%`, top: `${pp.y}%`, opacity: live ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 50, damping: 13 }}
      >
        <span className="absolute left-0 top-0 h-3 w-3 border-l border-t" style={{ borderColor: ins.accent }} />
        <span className="absolute right-0 top-0 h-3 w-3 border-r border-t" style={{ borderColor: ins.accent }} />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l" style={{ borderColor: ins.accent }} />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r" style={{ borderColor: ins.accent }} />
        <span
          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 font-mono text-[0.52rem] uppercase tracking-[0.2em]"
          style={{ color: ins.accent }}
        >
          {ins.eyebrow}
        </span>
      </motion.div>

      {/* Le noyau — Eden, au centre de gravité */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${core.x}%`, top: `${core.y}%` }}
        initial={reduce ? false : { scale: 0.45, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: reduce ? 0 : 1.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="pointer-events-none absolute -inset-24 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(20,150,150,0.4), rgba(49,49,132,0.22) 55%, transparent 75%)",
          }}
          animate={reduce ? undefined : { opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Onde de choc à l'allumage */}
        {live && !reduce ? (
          <motion.span
            className="absolute left-1/2 top-1/2 h-36 w-36 rounded-full border border-[#99ca3c]"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 3.6, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ) : null}
        {/* Onde d'absorption : quand l'impulsion de détection arrive */}
        {live ? (
          <motion.span
            key={active}
            className="absolute left-1/2 top-1/2 h-36 w-36 rounded-full border"
            style={{ borderColor: ins.accent, x: "-50%", y: "-50%" }}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut", delay: reduce ? 0 : 1.1 }}
          />
        ) : null}
        <motion.div
          className="relative flex h-32 w-32 items-center justify-center rounded-full sm:h-40 sm:w-40"
          style={{
            background:
              "radial-gradient(circle at 36% 32%, rgba(238,240,255,0.95), rgba(153,202,60,0.5) 38%, rgba(20,150,150,0.42) 66%, rgba(10,12,38,0) 78%)",
            boxShadow: "0 0 70px rgba(153,202,60,0.32), 0 0 180px rgba(20,150,150,0.28)",
          }}
          animate={reduce ? undefined : live ? { scale: [1, 1.045, 1] } : { scale: 1 }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src={symbole} alt="" className="w-12 opacity-80 brightness-0 invert sm:w-14" />
        </motion.div>
        <p className="mt-5 text-center font-mono text-[0.6rem] uppercase tracking-[0.34em] text-[#7a81b3]">
          Eden
        </p>
        {/* Traces de calcul : le système pense, à voix basse */}
        <div className="relative mt-1.5 h-4">
          {live ? (
            <AnimatePresence mode="wait">
              <motion.p
                key={`${active}-${trace}`}
                className="absolute left-1/2 top-0 w-72 text-center font-mono text-[0.52rem] lowercase tracking-[0.14em]"
                style={{ x: "-50%", color: ins.accent }}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 0.85, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4 }}
              >
                {ins.traces[trace % ins.traces.length]}
              </motion.p>
            </AnimatePresence>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

export default function SystemHero() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [connected, setConnected] = useState(0);
  const [active, setActive] = useState(0);
  const [secs, setSecs] = useState(2);
  const live = phase === "live";

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 70, damping: 22, mass: 0.9 });
  const springY = useSpring(pointerY, { stiffness: 70, damping: 22, mass: 0.9 });
  const farX = useTransform(springX, [0, 1], reduce ? [0, 0] : [6, -6]);
  const farY = useTransform(springY, [0, 1], reduce ? [0, 0] : [4, -4]);
  const nearX = useTransform(springX, [0, 1], reduce ? [0, 0] : [-11, 11]);
  const nearY = useTransform(springY, [0, 1], reduce ? [0, 0] : [-8, 8]);

  /* Projecteur : un halo discret suit le curseur dans la trame de points. */
  const spotX = useMotionValue(-600);
  const spotY = useMotionValue(-600);
  const spotSX = useSpring(spotX, { stiffness: 120, damping: 26 });
  const spotSY = useSpring(spotY, { stiffness: 120, damping: 26 });
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${spotSX}px ${spotSY}px, rgba(238,240,255,0.09), transparent 70%)`;

  /* L'éveil : les sources se connectent, puis le système passe en régime
     vivant. Ne démarre que quand l'onglet est visible — un chargement en
     arrière-plan ne doit pas consumer la séquence à vide. */
  useEffect(() => {
    if (reduce) {
      setConnected(10);
      setPhase("live");
      return;
    }
    let counter = 0;
    let t = 0;
    const start = () => {
      counter = window.setInterval(() => setConnected((c) => Math.min(c + 1, 10)), 230);
      t = window.setTimeout(() => setPhase("live"), BOOT_MS);
    };
    let poll = 0;
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(poll);
      start();
    };
    if (document.hidden) {
      document.addEventListener("visibilitychange", onVisible);
      // Filet : certains environnements embarqués n'émettent pas l'événement.
      poll = window.setInterval(onVisible, 500);
    } else {
      start();
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(poll);
      window.clearInterval(counter);
      window.clearTimeout(t);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce || !live) return;
    const t = window.setTimeout(
      () => setActive((a) => (a + 1) % insights.length),
      INSIGHT_MS,
    );
    return () => window.clearTimeout(t);
  }, [active, live, reduce]);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setSecs((s) => Math.min(s + 1, 59)), 1000);
    return () => window.clearInterval(t);
  }, [live]);
  useEffect(() => {
    setSecs(1);
  }, [active]);

  const ins = insights[active];
  /** Fondu des blocs de contenu pendant l'éveil. */
  const boot = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      className="relative -mt-[5.25rem] overflow-hidden bg-[#0a0c26] text-[#eef0ff]"
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width);
        pointerY.set((event.clientY - rect.top) / rect.height);
        spotX.set(event.clientX - rect.left);
        spotY.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        pointerX.set(0.5);
        pointerY.set(0.5);
        spotX.set(-600);
        spotY.set(-600);
      }}
    >
      {/* Couche lointaine : trame de points + aurores de la palette */}
      <motion.div style={{ x: farX, y: farY }} className="pointer-events-none absolute -inset-10">
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(238,240,255,0.07)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_80%_75%_at_50%_52%,black,transparent)]" />
        <motion.div
          className="absolute right-[-14%] top-[-18%] h-[34rem] w-[44rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(49,49,132,0.5), transparent)" }}
          animate={reduce ? undefined : { opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-22%] left-[-8%] h-[30rem] w-[40rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(20,150,150,0.22), transparent)" }}
          animate={reduce ? undefined : { opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </motion.div>

      {/* Projecteur curseur (desktop) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: spotlight }}
      />

      {/* Scène pleine page (desktop) — les planètes restent cliquables */}
      <motion.div
        style={{ x: nearX, y: nearY }}
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        <SystemCanvas idp="d" compact={false} active={active} phase={phase} onFocus={setActive} />
      </motion.div>

      {/* Vignette basse : garde les révélations lisibles sur la scène */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[36%] bg-gradient-to-t from-[#0a0c26] via-[#0a0c26]/55 to-transparent lg:block" />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[96rem] flex-col px-5 pb-10 pt-[7.5rem] sm:px-8 lg:px-12 lg:pb-12 lg:pt-[8rem]">
        {/* Barre d'état : compte les connexions pendant l'éveil */}
        <motion.div
          {...boot(0.1)}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#565c8c]"
        >
          <span
            className="flex items-center gap-2"
            style={{ color: live ? eden.leaf : eden.sun }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={live ? "live" : "boot"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {live ? "Système éveillé" : `Connexion des sources · ${connected}/10`}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" aria-hidden />
          <span>10 sources reliées</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" aria-hidden />
          <span>Dernier signal · {live ? `il y a ${secs} s` : "—"}</span>
        </motion.div>

        {/* Titre centré : émerge mot à mot quand le noyau s'allume */}
        <div className="mx-auto mt-9 max-w-4xl text-center sm:mt-12">
          <h1 className="text-balance text-[clamp(2.7rem,5.2vw,4.9rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            {TITLE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="inline-block whitespace-pre"
                initial={reduce ? false : { opacity: 0, y: 22, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.75,
                  delay: reduce ? 0 : 2.05 + i * 0.11,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
                {i < TITLE_WORDS.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </h1>
          <motion.p
            {...boot(2.55)}
            className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-[#a6abd1] sm:text-lg"
          >
            Eden relie les outils que vous utilisez déjà, lit ce qui s’y passe
            et fait remonter ce qui mérite une décision — avant que vous ayez
            à poser la question.
          </motion.p>
          <motion.div
            {...boot(2.75)}
            className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4"
          >
            <Link
              href="/financement"
              className="bg-[#99ca3c] px-6 py-3.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#0a0c26] transition-colors hover:bg-[#eef0ff]"
            >
              Connecter mon entreprise
            </Link>
            <a
              href="#veille"
              className="group border-b border-[#eef0ff]/30 pb-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#a6abd1] transition-colors hover:border-[#99ca3c] hover:text-[#99ca3c]"
            >
              Voir le système à l’œuvre
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          </motion.div>
        </div>

        {/* Scène compacte (mobile / tablette) */}
        <div className="pointer-events-auto relative mx-auto mt-12 aspect-[0.96] w-full max-w-lg lg:hidden">
          <SystemCanvas idp="m" compact active={active} phase={phase} onFocus={setActive} />
        </div>

        <div className="flex-1" aria-hidden />

        {/* Révélations */}
        <motion.div
          {...boot(2.95)}
          className="pointer-events-auto mt-12 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-end"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="font-mono text-[0.6rem] uppercase tracking-[0.22em]"
                style={{ color: ins.accent }}
              >
                {ins.eyebrow} · signal {active + 1}/{insights.length}
              </p>
              <p className="mt-3 text-xl font-medium leading-snug tracking-[-0.03em] text-[#eef0ff] sm:text-2xl">
                {ins.statement}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a6abd1]">{ins.detail}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 lg:justify-end lg:pb-1" role="tablist" aria-label="Signaux Eden">
            {insights.map((insight, index) => (
              <button
                key={insight.eyebrow}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={insight.eyebrow}
                onClick={() => setActive(index)}
                className="relative h-1 w-12 overflow-hidden bg-white/15 transition-colors hover:bg-white/25"
              >
                {index === active && live ? (
                  <motion.span
                    key={`${active}-fill`}
                    className="absolute inset-y-0 left-0"
                    style={{
                      background: insight.accent,
                      boxShadow: `0 0 10px ${insight.accent}`,
                    }}
                    initial={{ width: reduce ? "100%" : "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: reduce ? 0 : INSIGHT_MS / 1000, ease: "linear" }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

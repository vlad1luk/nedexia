"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type FieldStage = "unknown" | "revealing" | "unlocked";

type Props = {
  stage?: FieldStage;
  className?: string;
};

const nodes = [
  { id: "company", label: "Votre entreprise", x: 0.14, y: 0.56, reveal: 0 },
  { id: "funding", label: "Financement", x: 0.36, y: 0.3, reveal: 0.16 },
  { id: "program", label: "Programme", x: 0.57, y: 0.19, reveal: 0.32 },
  { id: "bank", label: "Institution", x: 0.73, y: 0.47, reveal: 0.48 },
  { id: "market", label: "Marché", x: 0.55, y: 0.79, reveal: 0.58 },
  { id: "partner", label: "Partenaire", x: 0.82, y: 0.74, reveal: 0.68 },
  { id: "investor", label: "Investisseur", x: 0.89, y: 0.25, reveal: 0.78 },
];

const edges = [
  ["company", "funding"],
  ["funding", "program"],
  ["program", "bank"],
  ["bank", "investor"],
  ["bank", "partner"],
  ["partner", "market"],
  ["funding", "market"],
  ["program", "investor"],
];

const pseudoRandom = (seed: number) =>
  Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;

const particles = Array.from({ length: 180 }, (_, index) => {
  const a = pseudoRandom(index + 1);
  const b = pseudoRandom(index + 101);
  return {
    x: a,
    y: b,
    z: pseudoRandom(index + 701),
    size: 0.5 + ((index * 17) % 10) / 10,
    opacity: 0.18 + ((index * 13) % 7) / 30,
    phase: (index * 1.73) % (Math.PI * 2),
  };
});

export default function PreparationMap({ stage = "revealing", className }: Props) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialProgress = stage === "unknown" ? 0.08 : stage === "unlocked" ? 1 : 0;
  const progressRef = useRef(initialProgress);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(initialProgress);
  const { scrollYProgress } = useScroll({
    target: fieldRef,
    offset: ["start 88%", "end 18%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (stage !== "revealing") return;
    progressRef.current = latest;
    setProgress(latest);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = fieldRef.current;
    if (!canvas || !field) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = field.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const progressValue = progressRef.current;
      const motionTime = reduce ? 0 : time * 0.00022;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#07111b";
      context.fillRect(0, 0, width, height);

      const atmosphere = context.createRadialGradient(
        width * 0.52,
        height * 0.5,
        0,
        width * 0.52,
        height * 0.5,
        Math.max(width, height) * 0.7
      );
      atmosphere.addColorStop(0, "rgba(74,112,148,0.18)");
      atmosphere.addColorStop(0.4, "rgba(22,48,70,0.08)");
      atmosphere.addColorStop(1, "rgba(7,17,27,0)");
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        const depth = 0.25 + particle.z * 0.75;
        const cameraX = (pointerRef.current.x - 0.5) * (1 - depth) * 26;
        const cameraY = (pointerRef.current.y - 0.5) * (1 - depth) * 18;
        const driftX = Math.sin(motionTime + particle.phase) * (2 + depth * 8);
        const driftY = Math.cos(motionTime * 1.2 + particle.phase) * (2 + depth * 7);
        const x = width * 0.5 + (particle.x - 0.5) * width * (0.72 + depth * 0.52) + driftX + cameraX;
        const y = height * 0.5 + (particle.y - 0.5) * height * (0.68 + depth * 0.48) + driftY + cameraY;
        const distance = Math.hypot(x - pointerRef.current.x * width, y - pointerRef.current.y * height);
        const pointerBoost = distance < 170 ? (1 - distance / 170) * 0.4 : 0;
        context.fillStyle = "rgba(219,232,224," + (particle.opacity * depth + pointerBoost) + ")";
        context.beginPath();
        context.arc(x, y, particle.size * depth, 0, Math.PI * 2);
        context.fill();
      });

      const visibleNodes = nodes.filter((node) => node.reveal <= progressValue);
      const nodeMap = new Map(visibleNodes.map((node) => [node.id, node]));

      edges.forEach(([fromId, toId]) => {
        const from = nodeMap.get(fromId);
        const to = nodeMap.get(toId);
        if (!from || !to) return;
        const edgeReveal = Math.max(from.reveal, to.reveal);
        const edgeProgress = Math.min(1, Math.max(0, (progressValue - edgeReveal) / 0.22));
        const startX = from.x * width;
        const startY = from.y * height;
        const endX = to.x * width;
        const endY = to.y * height;
        const currentX = startX + (endX - startX) * edgeProgress;
        const currentY = startY + (endY - startY) * edgeProgress;
        context.strokeStyle = edgeReveal < 0.38 ? "rgba(214,179,106,0.82)" : "rgba(111,168,255,0.55)";
        context.lineWidth = edgeReveal < 0.38 ? 1.5 : 1;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(currentX, currentY);
        context.stroke();
      });

      visibleNodes.forEach((node) => {
        const x = node.x * width;
        const y = node.y * height;
        const radius = node.id === "company" ? 5.5 : 3.2;
        context.fillStyle = node.id === "company" ? "#d6b36a" : node.reveal < 0.38 ? "#d6b36a" : "#6fa8ff";
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = node.id === "company" ? "rgba(214,179,106,0.28)" : "rgba(111,168,255,0.22)";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(x, y, radius + 7, 0, Math.PI * 2);
        context.stroke();
      });

      frame = requestAnimationFrame(draw);
    };

    const movePointer = (event: PointerEvent) => {
      const rect = field.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    resize();
    window.addEventListener("resize", resize);
    field.addEventListener("pointermove", movePointer);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      field.removeEventListener("pointermove", movePointer);
    };
  }, [reduce, stage]);

  const visibleNodes = nodes.filter((node) => node.reveal <= progress || (stage === "unknown" && node.id === "company"));

  return (
    <div
      ref={fieldRef}
      className={cn("relative mt-14 min-h-[27rem] overflow-hidden border-y border-[#f4f0e8]/15 bg-[#07111b] sm:mt-20 sm:min-h-[34rem]", className)}
      aria-label="Cartographie du territoire économique de Nedexia"
      role="img"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8ea29f] sm:inset-x-8 sm:top-7">
        <span>Territoire économique / {stage === "unlocked" ? "accès élargi" : "lecture en cours"}</span>
        <span>{String(Math.round(progress * 100)).padStart(2, "0")} % visible</span>
      </div>

      {nodes.map((node) => {
        const visible = visibleNodes.some((visibleNode) => visibleNode.id === node.id);
        return (
          <div
            key={node.id}
            className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700", visible ? "opacity-100" : "opacity-0")}
            style={{ left: node.x * 100 + "%", top: node.y * 100 + "%" }}
          >
            <span className={cn("block whitespace-nowrap text-[0.57rem] font-bold uppercase tracking-[0.14em]", node.id === "company" ? "text-[#d6b36a]" : node.reveal < 0.38 ? "text-[#d6b36a]" : "text-[#6fa8ff]")}>
              {node.label}
            </span>
          </div>
        );
      })}

      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8ea29f] sm:inset-x-8 sm:bottom-7">
        <span>invisible</span>
        <span className="text-right text-[#7fcf8a]">connexions activables</span>
      </div>
    </div>
  );
}

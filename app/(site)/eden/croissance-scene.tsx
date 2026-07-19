"use client";

import { Tree } from "@dgreenheck/ez-tree";
import { Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Scène 3D « jardin de nuit » — l'arbre d'Eden.
 *
 * L'arbre est procédural (ez-tree, preset Ash Medium) : à chaque cran
 * de scroll on interpole les longueurs/rayons de branches par niveau
 * et la taille des feuilles, puis on régénère la géométrie (throttlé).
 * Le tronc pousse d'abord, puis les branches maîtresses, les rameaux,
 * et enfin les feuilles éclosent. Le vent des feuilles est le shader
 * natif d'ez-tree (`tree.update`). La rotation, l'échelle et la caméra
 * suivent la même progression — l'arbre grossit et tourne sous le
 * geste du visiteur. Chargé dynamiquement (ssr: false) pour garder la
 * page légère.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const TREE_SCALE = {
  seedling: 0.1,
  mature: 0.19,
  narrowViewportMin: 0.7,
};

type Growable = {
  branch: { length: Record<number, number>; radius: Record<number, number> };
  leaves: { size: number };
};

type GrowthProps = {
  progress: React.RefObject<number>;
  reduce: boolean;
};

function prepareTree(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

/** Applique la progression de croissance p (0..1) aux options de l'arbre. */
function applyGrowth(options: Growable, base: Growable, p: number) {
  // Chaque niveau démarre après le précédent : tronc → branches →
  // rameaux → brindilles, puis les feuilles éclosent en dernier.
  const g = [
    easeOut(ramp(p, 0.0, 0.42)),
    easeOut(ramp(p, 0.14, 0.62)),
    easeOut(ramp(p, 0.32, 0.8)),
    easeOut(ramp(p, 0.48, 0.92)),
  ];
  for (let level = 0; level < 4; level++) {
    const bl = base.branch.length[level] ?? 0;
    const br = base.branch.radius[level] ?? 0;
    options.branch.length[level] = Math.max(0.05, bl * (level === 0 ? 0.1 + 0.9 * g[0] : g[level]));
    options.branch.radius[level] = Math.max(0.02, br * (level === 0 ? 0.22 + 0.78 * g[0] : Math.max(0.2, g[level])));
  }
  options.leaves.size = Math.max(0.02, base.leaves.size * easeOut(ramp(p, 0.55, 0.96)));
}

function EdenTree({ progress, reduce }: GrowthProps) {
  const [tree] = useState(() => {
    const t = new Tree();
    t.loadPreset("Ash Medium");
    t.options.leaves.tint = new THREE.Color("#98ef66").getHex();
    t.options.bark.tint = new THREE.Color("#684f38").getHex();
    const base = JSON.parse(JSON.stringify(t.options)) as Growable;
    applyGrowth(t.options as unknown as Growable, base, reduce ? 1 : 0);
    t.generate();
    prepareTree(t);
    return Object.assign(t, { __base: base });
  });
  const treeRef = useRef(tree);

  const lastP = useRef(reduce ? 1 : 0);
  const lastT = useRef(0);

  useFrame((state) => {
    const currentTree = treeRef.current;
    if (!currentTree) return;
    const p = reduce ? 1 : clamp01(progress.current ?? 0);

    /* Vent : shader natif d'ez-tree sur les feuilles. */
    if (!reduce) currentTree.update(state.clock.elapsedTime);

    /*
     * L'arbre grossit et tourne avec le scroll. Le preset « Ash Medium »
     * dépasse 40 unités de haut : on le garde volontairement sous sa taille
     * native, puis on réduit encore son empreinte sur les écrans étroits pour
     * que la canopée reste visible en entier.
     */
    currentTree.rotation.y = p * Math.PI * 1.3;
    currentTree.rotation.z = Math.sin(p * Math.PI) * 0.018;
    currentTree.position.y = lerp(-0.42, -0.12, easeOut(p));
    const aspect = state.size.width / state.size.height;
    const viewportScale = THREE.MathUtils.clamp(
      aspect / 0.9,
      TREE_SCALE.narrowViewportMin,
      1,
    );
    currentTree.scale.setScalar(
      lerp(TREE_SCALE.seedling, TREE_SCALE.mature, easeOut(p)) * viewportScale,
    );

    /* La caméra recule à mesure que l'arbre prend sa place. */
    const cam = state.camera;
    cam.position.set(
      Math.sin(p * 1.25) * 2.7,
      lerp(2.4, 9.5, easeOut(p)),
      lerp(14, 34, easeOut(p)),
    );
    cam.lookAt(0, lerp(1.5, 8.7, easeOut(p)), 0);

    /* Croissance : régénération throttlée de la géométrie. */
    const now = state.clock.elapsedTime;
    if (!reduce && Math.abs(p - lastP.current) > 0.004 && now - lastT.current > 0.07) {
      applyGrowth(currentTree.options as unknown as Growable, currentTree.__base, p);
      currentTree.generate();
      prepareTree(currentTree);
      lastP.current = p;
      lastT.current = now;
    }
  });

  return <primitive object={tree} />;
}

const ROOT_COLORS = ["#3a378f", "#22b9dc", "#1d9fb9", "#5551a8"];

function RootSignal({
  curve,
  index,
  progress,
  reduce,
}: GrowthProps & { curve: THREE.CatmullRomCurve3; index: number }) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const color = ROOT_COLORS[index % ROOT_COLORS.length];

  useFrame((state) => {
    const p = reduce ? 1 : clamp01(progress.current ?? 0);
    const reveal = easeOut(ramp(p, 0.04 + index * 0.006, 0.58 + index * 0.009));
    const scale = 0.08 + reveal * 0.92;
    const pulseCycle = (state.clock.elapsedTime * 0.12 + index * 0.117) % 1;
    const point = curve.getPointAt(Math.max(0.01, reveal * (1 - pulseCycle)));

    if (group.current) group.current.scale.setScalar(scale);
    if (material.current) material.current.opacity = reveal * (0.08 + (index % 3) * 0.018);
    if (pulse.current) {
      pulse.current.position.copy(point);
      pulse.current.visible = reveal > 0.1;
      pulse.current.scale.setScalar((0.55 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.14) * reveal);
    }
    if (pulseMaterial.current) pulseMaterial.current.opacity = reveal * (0.45 + (1 - pulseCycle) * 0.35);
  });

  return (
    <group ref={group}>
      <mesh>
        <tubeGeometry args={[curve, 56, 0.028 + (index % 3) * 0.007, 5, false]} />
        <meshBasicMaterial
          ref={material}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial
          ref={pulseMaterial}
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function LivingRoots({ progress, reduce }: GrowthProps) {
  const roots = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) => {
        const angle = (index / 15) * Math.PI * 2 + Math.sin(index * 2.4) * 0.11;
        const radius = 9.5 + (index % 5) * 1.65;
        const sway = (index % 2 ? 1 : -1) * (1.25 + (index % 3) * 0.42);
        const tangentX = Math.cos(angle + Math.PI / 2) * sway;
        const tangentZ = Math.sin(angle + Math.PI / 2) * sway;
        return new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.18 * Math.cos(angle), 0.045, 0.18 * Math.sin(angle)),
          new THREE.Vector3(
            Math.cos(angle) * radius * 0.26 + tangentX,
            0.035,
            Math.sin(angle) * radius * 0.26 + tangentZ,
          ),
          new THREE.Vector3(
            Math.cos(angle) * radius * 0.62 - tangentX * 0.7,
            0.025,
            Math.sin(angle) * radius * 0.62 - tangentZ * 0.7,
          ),
          new THREE.Vector3(Math.cos(angle) * radius, 0.018, Math.sin(angle) * radius),
        ]);
      }),
    [],
  );

  return (
    <group>
      {roots.map((curve, index) => (
        <RootSignal
          key={index}
          curve={curve}
          index={index}
          progress={progress}
          reduce={reduce}
        />
      ))}
    </group>
  );
}

function GrowthHalo({ progress, reduce }: GrowthProps) {
  const group = useRef<THREE.Group>(null);
  const portal = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    const p = reduce ? 1 : clamp01(progress.current ?? 0);
    const reveal = easeOut(ramp(p, 0.18, 0.78));
    if (group.current) {
      group.current.rotation.y += delta * 0.055;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.025;
      group.current.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (!(child.material instanceof THREE.MeshBasicMaterial)) return;
        child.material.opacity = reveal * Number(child.userData.opacity ?? 0.08);
      });
    }
    if (portal.current) portal.current.opacity = 0.035 + reveal * 0.1;
  });

  const rings = [
    { radius: 3.2, y: 2.2, opacity: 0.14, color: "#22b9dc", tilt: 0.03 },
    { radius: 5.4, y: 4.8, opacity: 0.09, color: "#1d9fb9", tilt: -0.08 },
    { radius: 7.4, y: 7.2, opacity: 0.055, color: "#5551a8", tilt: 0.12 },
  ];

  return (
    <>
      <mesh position={[0, 7.8, -12]}>
        <ringGeometry args={[8.8, 8.86, 160]} />
        <meshBasicMaterial
          ref={portal}
          color="#3a378f"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <group ref={group}>
        {rings.map((ring) => (
          <mesh
            key={ring.radius}
            position={[0, ring.y, 0]}
            rotation={[Math.PI / 2 + ring.tilt, ring.tilt * 0.6, 0]}
            userData={{ opacity: ring.opacity }}
          >
            <torusGeometry args={[ring.radius, 0.025, 6, 128]} />
            <meshBasicMaterial
              color={ring.color}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

function GrowthLighting({ progress, reduce }: GrowthProps) {
  const crown = useRef<THREE.SpotLight>(null);
  const roots = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const p = reduce ? 1 : clamp01(progress.current ?? 0);
    const leaf = easeOut(ramp(p, 0.42, 1));
    if (crown.current) crown.current.intensity = lerp(18, 72, leaf);
    if (roots.current) roots.current.intensity = lerp(12, 48, easeOut(ramp(p, 0, 0.62)));
    if (rim.current) rim.current.intensity = lerp(0.8, 2.4, leaf);
  });

  return (
    <>
      <ambientLight color="#6d6bce" intensity={0.62} />
      <hemisphereLight args={["#c6d1ff", "#03120d", 1.2]} />
      <directionalLight position={[10, 18, 8]} color="#eef2ff" intensity={2.15} castShadow />
      <directionalLight ref={rim} position={[-10, 10, -9]} color="#22b9dc" intensity={1.2} />
      <spotLight
        ref={crown}
        position={[0, 23, 7]}
        angle={0.42}
        penumbra={0.96}
        color="#70efff"
        intensity={20}
        distance={62}
      />
      <pointLight ref={roots} position={[0, 0.45, 2]} color="#22b9dc" intensity={14} distance={28} />
      <pointLight position={[-8, 7, -3]} color="#3a378f" intensity={30} distance={38} />
      <pointLight position={[7, 6, 6]} color="#1d9fb9" intensity={20} distance={30} />
    </>
  );
}

function GrowthGround({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current || reduce) return;
    group.current.rotation.z += delta * 0.018;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.012;
  });

  const rings = [
    { radius: 3.4, color: "#22b9dc", opacity: 0.3 },
    { radius: 5.8, color: "#1d9fb9", opacity: 0.2 },
    { radius: 8.7, color: "#64cbe6", opacity: 0.13 },
    { radius: 12.3, color: "#5551a8", opacity: 0.09 },
    { radius: 16.8, color: "#3a378f", opacity: 0.055 },
  ];

  return (
    <group ref={group} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
      {rings.map((ring) => (
        <mesh key={ring.radius}>
          <ringGeometry args={[ring.radius - 0.035, ring.radius, 96]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function CroissanceScene({
  progress,
}: {
  progress: React.RefObject<number>;
}) {
  const reduce = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <Canvas
      shadows={{ enabled: true, type: THREE.PCFShadowMap }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.5, far: 140, position: [0, 2.6, 13] }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.24;
      }}
    >
      <fog attach="fog" args={["#04070e", 24, 105]} />
      <GrowthLighting progress={progress} reduce={reduce} />
      <GrowthHalo progress={progress} reduce={reduce} />
      <LivingRoots progress={progress} reduce={reduce} />

      <EdenTree progress={progress} reduce={reduce} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#03090b" roughness={0.88} metalness={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[4.8, 64]} />
        <meshBasicMaterial
          color="#22b9dc"
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <GrowthGround reduce={reduce} />

      <Sparkles
        count={105}
        scale={[34, 20, 30]}
        position={[0, 8, 0]}
        size={2.2}
        speed={0.24}
        opacity={0.5}
        color="#d8e9f2"
      />
      <Sparkles
        count={68}
        scale={[22, 12, 20]}
        position={[0, 4, 4]}
        size={1.7}
        speed={0.18}
        opacity={0.45}
        color="#22b9dc"
      />
      <Sparkles
        count={28}
        scale={[24, 14, 20]}
        position={[0, 9, -2]}
        size={1.35}
        speed={0.14}
        opacity={0.35}
        color="#6e6ab8"
      />
    </Canvas>
  );
}

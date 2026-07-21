"use client";

import { Tree } from "@dgreenheck/ez-tree";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const ramp = (progress: number, start: number, end: number) =>
  clamp01((progress - start) / (end - start));
const easeOut = (value: number) => 1 - (1 - value) * (1 - value);
const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

type SceneProps = {
  progress: React.RefObject<number>;
  reduce: boolean;
};

function prepareTree(tree: Tree) {
  tree.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (!(child.material instanceof THREE.MeshPhongMaterial)) return;

    if (child.material.name === "leaves") {
      child.material.color.set("#71955a");
      child.material.emissive.set("#132516");
      child.material.emissiveIntensity = 0.12;
      child.material.shininess = 8;
      child.material.transparent = true;
    }

    if (child.material.name === "branches") {
      child.material.color.set("#795b42");
      child.material.specular.set("#4d4439");
      child.material.shininess = 5;
    }
  });
}

function RealTree({ progress, reduce }: SceneProps) {
  const [tree] = useState(() => {
    const nextTree = new Tree();
    nextTree.loadPreset("Oak Medium");
    nextTree.options.leaves.tint = new THREE.Color("#71955a").getHex();
    nextTree.options.leaves.size = 2.65;
    nextTree.options.leaves.sizeVariance = 0.55;
    nextTree.options.leaves.alphaTest = 0.42;
    nextTree.options.bark.tint = new THREE.Color("#795b42").getHex();
    nextTree.generate();
    prepareTree(nextTree);
    return nextTree;
  });
  const treeRef = useRef(tree);

  useFrame((state) => {
    const currentTree = treeRef.current;
    const progressValue = reduce ? 1 : clamp01(progress.current ?? 0);
    const growth = easeOut(ramp(progressValue, 0.08, 0.76));
    const leaves = easeOut(ramp(progressValue, 0.42, 0.9));
    const aspect = state.size.width / state.size.height;
    const viewportScale = THREE.MathUtils.clamp(aspect / 0.92, 0.7, 1);
    const scale = lerp(0.045, 0.205, growth) * viewportScale;

    currentTree.update(state.clock.elapsedTime * 0.32);
    currentTree.scale.set(
      scale * lerp(0.82, 1, leaves),
      scale,
      scale * lerp(0.82, 1, leaves),
    );
    currentTree.position.x = aspect < 0.65 ? 0.32 : 0;
    currentTree.position.y = lerp(-0.25, -0.04, growth);
    currentTree.rotation.y = -0.08;
    currentTree.rotation.z = Math.sin(progressValue * Math.PI) * 0.006;

    currentTree.leavesMesh.scale.setScalar(lerp(0.62, 1, leaves));
    const leafMaterial = currentTree.leavesMesh
      .material as THREE.MeshPhongMaterial;
    leafMaterial.opacity = lerp(0.06, 1, leaves);
    leafMaterial.alphaTest = lerp(0.7, 0.42, leaves);

    const narrow = clamp01((aspect - 0.42) / 0.58);
    const camera = state.camera;
    camera.position.set(
      lerp(0.25, 1.15, narrow),
      lerp(5.4, 6.4, narrow),
      lerp(30.5, 28.5, narrow),
    );
    camera.lookAt(0, lerp(5.1, 5.8, narrow), 0);
  });

  return <primitive object={tree} />;
}

function SoftTreeShadow({ progress, reduce }: SceneProps) {
  const shadow = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(128, 128, 3, 128, 128, 126);
      gradient.addColorStop(0, "rgba(20, 31, 21, 0.72)");
      gradient.addColorStop(0.34, "rgba(24, 36, 24, 0.42)");
      gradient.addColorStop(1, "rgba(24, 36, 24, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    }
    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    return nextTexture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const progressValue = reduce ? 1 : clamp01(progress.current ?? 0);
    const growth = easeOut(ramp(progressValue, 0.08, 0.76));
    if (shadow.current) {
      const scale = lerp(0.4, 1, growth);
      shadow.current.scale.set(11 * scale, 4.5 * scale, 1);
    }
    if (material.current) material.current.opacity = growth * 0.25;
  });

  return (
    <mesh ref={shadow} position={[1.7, 0.024, 1.2]} rotation={[-Math.PI / 2, 0, -0.3]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function NaturalLight() {
  return (
    <>
      <ambientLight color="#dbe7df" intensity={0.78} />
      <hemisphereLight args={["#edf5f6", "#58634b", 1.65]} />
      <directionalLight
        position={[-9, 18, 11]}
        color="#fff0cd"
        intensity={3.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={18}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={55}
        shadow-bias={-0.0003}
      />
      <directionalLight position={[9, 10, -8]} color="#c7ddec" intensity={1.05} />
    </>
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
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.45]}
      camera={{ fov: 38, near: 0.5, far: 100, position: [1, 6, 29] }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <fog attach="fog" args={["#dce6df", 24, 74]} />
      <NaturalLight />

      <RealTree progress={progress} reduce={reduce} />
      <SoftTreeShadow progress={progress} reduce={reduce} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[60, 72]} />
        <meshStandardMaterial color="#7e8e70" roughness={1} metalness={0} />
      </mesh>
    </Canvas>
  );
}

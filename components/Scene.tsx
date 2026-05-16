"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Stars,
  AdaptiveDpr,
  AdaptiveEvents,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { VisualizerMesh } from "./VisualizerMesh";
import { useAudio } from "./AudioProvider";

/**
 * Adds smooth mouse-reactive inertia to the active camera. Pointer position
 * is tracked on the window and lerped into a small additive offset applied on
 * top of the orbit controls' camera transform each frame.
 */
function CameraInertia() {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current.x = nx;
      target.current.y = ny;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const t = Math.min(1, delta * 3);
    current.current.x += (target.current.x - current.current.x) * t;
    current.current.y += (target.current.y - current.current.y) * t;

    camera.position.x += (current.current.x * 0.6 - camera.position.x * 0.02) *
      Math.min(1, delta * 1.5);
    camera.position.y += (-current.current.y * 0.35 - (camera.position.y - 0.8) * 0.02) *
      Math.min(1, delta * 1.5);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Reactive lights pulsing with bass. */
function ReactiveLights() {
  const pointA = useRef<THREE.PointLight>(null);
  const pointB = useRef<THREE.PointLight>(null);
  const pointC = useRef<THREE.PointLight>(null);
  const { bandsRef } = useAudio();

  useFrame((state, delta) => {
    const b = bandsRef.current;
    const t = state.clock.elapsedTime;
    if (pointA.current) {
      pointA.current.intensity =
        8 + b.bass * 80 + Math.sin(t * 1.7) * 2;
      pointA.current.position.x = Math.sin(t * 0.4) * 4;
      pointA.current.position.z = Math.cos(t * 0.4) * 4;
    }
    if (pointB.current) {
      pointB.current.intensity = 6 + b.mid * 60;
      pointB.current.position.x = Math.cos(t * 0.3 + 1.2) * 4.5;
      pointB.current.position.z = Math.sin(t * 0.3 + 1.2) * 4.5;
    }
    if (pointC.current) {
      pointC.current.intensity = 4 + b.treble * 60;
      pointC.current.position.y = 2 + Math.sin(t * 0.9) * 1.2;
    }
    // Silence unused-var lint via noop.
    void delta;
  });

  return (
    <>
      <ambientLight intensity={0.25} color={"#1a1c2e"} />
      <pointLight
        ref={pointA}
        color={"#22e3ff"}
        position={[3, 2, 3]}
        distance={18}
        decay={1.6}
      />
      <pointLight
        ref={pointB}
        color={"#9b5cff"}
        position={[-3, 1.5, -3]}
        distance={18}
        decay={1.6}
      />
      <pointLight
        ref={pointC}
        color={"#ff3df0"}
        position={[0, 3, 0]}
        distance={14}
        decay={1.6}
      />
    </>
  );
}

export function Scene() {
  return (
    <Canvas
      className="!absolute inset-0"
      shadows={false}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ position: [0, 0.8, 6.5], fov: 55, near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#05060a"), 1);
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />

      <Suspense fallback={null}>
        <fog attach="fog" args={["#05060a", 8, 22]} />
        <ReactiveLights />
        <Stars
          radius={60}
          depth={40}
          count={2200}
          factor={3}
          fade
          saturation={0}
          speed={0.4}
        />
        <Environment preset="night" />
        <VisualizerMesh />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.6}
        minDistance={3.5}
        maxDistance={14}
        target={[0, 0, 0]}
      />
      <CameraInertia />

      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.85}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

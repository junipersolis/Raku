"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { createNoise3D, createNoise4D } from "simplex-noise";
import { useAudio } from "@/components/AudioProvider";
import { getState, useVisualizerStore } from "@/lib/visualizer-store";

/**
 * The deformable mesh at the heart of the scene. Owns a single BufferGeometry
 * whose vertex positions are recomputed every frame from a 3D/4D simplex noise
 * field that is *modulated* by audio frequency bands.
 *
 * Performance notes:
 *  - All Three.js objects are stored on refs; nothing in `useFrame` triggers
 *    React re-renders.
 *  - The original (rest) positions are cached as a Float32Array so we can
 *    deform from the un-warped base each frame instead of accumulating drift.
 *  - Frequency data is sampled once per frame on the AudioEngine and shared
 *    with all consumers via a ref on the audio context.
 */

const PLANE_SIZE = 14;
const PLANE_SEGMENTS = 192;
const SPHERE_RADIUS = 2.4;
const SPHERE_SEGMENTS = 160;

export function VisualizerMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const planeGeoRef = useRef<THREE.PlaneGeometry>(null);
  const sphereGeoRef = useRef<THREE.SphereGeometry>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const { engineRef, bandsRef } = useAudio();

  const noise3D = useMemo(() => createNoise3D(), []);
  const noise4D = useMemo(() => createNoise4D(), []);

  // Cache the un-deformed positions for both geometries so we can re-displace
  // from the original rest pose each frame. We populate these lazily once the
  // geometry refs mount via the `onUpdate` callback below.
  const restPositions = useRef<{
    plane?: Float32Array;
    sphere?: Float32Array;
  }>({});

  // Cache normalized rest direction vectors for the sphere (so we can extrude
  // along the outward normal cheaply each frame).
  const sphereNormals = useRef<Float32Array | null>(null);

  const tmpColor = useMemo(() => new THREE.Color(), []);
  const targetColor = useMemo(() => new THREE.Color("#22e3ff"), []);
  const tmpScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const ui = getState();
    const engine = engineRef.current;

    let bass = 0;
    let mid = 0;
    let treble = 0;
    let level = 0;

    if (engine) {
      engine.sample();
      const bands = engine.getBands();
      bass = bands.bass;
      mid = bands.mid;
      treble = bands.treble;
      level = bands.level;
      bandsRef.current = bands;
    }

    const time = state.clock.elapsedTime;
    const intensity = ui.intensity;

    // Pick the live geometry based on the toggle and update its positions.
    const geo: THREE.BufferGeometry | null =
      ui.meshKind === "plane"
        ? (planeGeoRef.current as unknown as THREE.BufferGeometry | null)
        : (sphereGeoRef.current as unknown as THREE.BufferGeometry | null);

    if (geo) {
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      if (ui.meshKind === "plane") {
        let rest = restPositions.current.plane;
        if (!rest || rest.length !== arr.length) {
          rest = new Float32Array(arr);
          restPositions.current.plane = rest;
        }

        const freq = 0.18;
        const baseAmp = 0.35 + bass * 2.4 * intensity;
        const detailAmp = 0.18 + treble * 1.1 * intensity;

        for (let i = 0; i < arr.length; i += 3) {
          const x = rest[i];
          const y = rest[i + 1];
          const big = noise4D(x * freq, y * freq, time * 0.35, bass * 1.5);
          const small = noise3D(
            x * freq * 3.2,
            y * freq * 3.2,
            time * 0.9 + mid * 2,
          );
          arr[i + 2] = big * baseAmp + small * detailAmp * 0.6;
        }
      } else {
        let rest = restPositions.current.sphere;
        let normals = sphereNormals.current;
        if (!rest || rest.length !== arr.length) {
          rest = new Float32Array(arr);
          restPositions.current.sphere = rest;
          normals = new Float32Array(arr.length);
          for (let i = 0; i < arr.length; i += 3) {
            const x = rest[i];
            const y = rest[i + 1];
            const z = rest[i + 2];
            const len = Math.hypot(x, y, z) || 1;
            normals[i] = x / len;
            normals[i + 1] = y / len;
            normals[i + 2] = z / len;
          }
          sphereNormals.current = normals;
        }
        const n = normals as Float32Array;

        const freq = 0.9;
        const baseAmp = 0.18 + bass * 1.2 * intensity;
        const detailAmp = 0.06 + treble * 0.55 * intensity;
        const breath = 0.08 + level * 0.35 * intensity;

        for (let i = 0; i < arr.length; i += 3) {
          const rx = rest[i];
          const ry = rest[i + 1];
          const rz = rest[i + 2];
          const big = noise4D(
            rx * freq,
            ry * freq,
            rz * freq,
            time * 0.35 + bass,
          );
          const small = noise3D(
            rx * freq * 2.6 + time * 0.4,
            ry * freq * 2.6,
            rz * freq * 2.6 + mid * 2,
          );
          const disp = big * baseAmp + small * detailAmp + breath;
          arr[i] = rx + n[i] * disp;
          arr[i + 1] = ry + n[i + 1] * disp;
          arr[i + 2] = rz + n[i + 2] * disp;
        }
      }

      posAttr.needsUpdate = true;
      // Cheap-ish but needed for lighting on the solid material.
      if (ui.styleKind === "solid") {
        geo.computeVertexNormals();
      }
    }

    // Material modulation
    const emissiveTarget = 0.6 + level * 2.2;
    material.emissiveIntensity +=
      (emissiveTarget - material.emissiveIntensity) * Math.min(1, delta * 8);

    // Hue cycles slowly with treble; saturates with bass.
    const hue = (time * 0.04 + treble * 0.6) % 1;
    const sat = 0.55 + bass * 0.45;
    const lig = 0.5 + mid * 0.25;
    tmpColor.setHSL(hue, sat, lig);
    targetColor.lerp(tmpColor, Math.min(1, delta * 1.6));
    material.emissive.copy(targetColor);
    material.color.copy(targetColor).multiplyScalar(0.35);

    // Mesh rotation - subtle continuous motion, kicked by bass.
    if (ui.meshKind === "sphere") {
      mesh.rotation.y += delta * (0.12 + bass * 0.8);
      mesh.rotation.x += delta * (0.04 + mid * 0.35);
      mesh.rotation.z = 0;
      mesh.position.set(0, 0, 0);
    } else {
      // For the plane, lay it flat and add a slight bob.
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.y = 0;
      mesh.rotation.z += delta * (0.02 + treble * 0.18);
      mesh.position.set(0, -1.6, 0);
    }

    const scaleTarget = 1 + level * 0.18 * intensity;
    tmpScale.set(scaleTarget, scaleTarget, scaleTarget);
    mesh.scale.lerp(tmpScale, Math.min(1, delta * 6));
  });

  const ui = useVisualizerStore();
  const isWireframe = ui.styleKind === "wireframe";
  const isPlane = ui.meshKind === "plane";

  return (
    <mesh ref={meshRef} castShadow receiveShadow frustumCulled={false}>
      {/*
        We render only the *active* geometry at any one time. Switching the
        mesh kind unmounts/remounts the geometry, which is cheap and avoids
        keeping two unused buffers in memory.
      */}
      <SwitchedGeometry
        planeRef={planeGeoRef}
        sphereRef={sphereGeoRef}
        restRef={restPositions}
        sphereNormalsRef={sphereNormals}
      />
      <meshPhysicalMaterial
        ref={materialRef}
        wireframe={isWireframe}
        color={"#0b0c1a"}
        emissive={"#22e3ff"}
        emissiveIntensity={1.2}
        metalness={0.45}
        roughness={0.25}
        clearcoat={isWireframe ? 0 : 0.6}
        clearcoatRoughness={0.35}
        transmission={0}
        reflectivity={0.6}
        toneMapped={false}
        flatShading={!isPlane && !isWireframe}
      />
    </mesh>
  );
}

/**
 * Renders whichever geometry is currently selected. Resets the cached rest
 * positions when the mesh kind changes so the new geometry deforms from its
 * own rest pose rather than the previous one's array.
 */
function SwitchedGeometry({
  planeRef,
  sphereRef,
  restRef,
  sphereNormalsRef,
}: {
  planeRef: React.MutableRefObject<THREE.PlaneGeometry | null>;
  sphereRef: React.MutableRefObject<THREE.SphereGeometry | null>;
  restRef: React.MutableRefObject<{
    plane?: Float32Array;
    sphere?: Float32Array;
  }>;
  sphereNormalsRef: React.MutableRefObject<Float32Array | null>;
}) {
  // Subscribe to the store so React remounts the correct geometry on toggle.
  // The frame loop continues running against whichever geometry is mounted.
  const { meshKind } = useVisualizerStore();

  if (meshKind === "plane") {
    return (
      <planeGeometry
        ref={planeRef}
        args={[PLANE_SIZE, PLANE_SIZE, PLANE_SEGMENTS, PLANE_SEGMENTS]}
        onUpdate={(g) => {
          restRef.current.plane = undefined;
          // Clear stale sphere caches.
          restRef.current.sphere = undefined;
          sphereNormalsRef.current = null;
          g.computeVertexNormals();
        }}
      />
    );
  }

  return (
    <sphereGeometry
      ref={sphereRef}
      args={[SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]}
      onUpdate={(g) => {
        restRef.current.sphere = undefined;
        restRef.current.plane = undefined;
        sphereNormalsRef.current = null;
        g.computeVertexNormals();
      }}
    />
  );
}

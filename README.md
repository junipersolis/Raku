# RAKU · 3D Audio Visualizer

A production-ready, fully code-driven 3D audio visualizer built with **Next.js (App Router)**, **Tailwind CSS**, **React Three Fiber**, and **@react-three/drei**. No external 3D models or textures — every visual is generated procedurally with shaders, simplex noise, and the Web Audio API.

## Features

- **Real-time 3D mesh** that ripples, vibrates, and deforms in sync with audio.
  - Toggleable between a **sphere** (extruded along outward normals) and a **plane terrain** (height-mapped).
  - Toggleable between **solid** (glowing `MeshPhysicalMaterial`) and **wireframe / grid** styles.
- **Web Audio API analyzer** chain: `<audio>` → `MediaElementSource` → `Gain` → `Analyser` → `destination`.
  - Frequency bytes are sampled once per frame and split into **bass / lowMid / mid / treble / level** bands.
  - Data is read from a pre-allocated `Uint8Array` and shared via refs — zero allocations per frame.
- **Sleek Tailwind UI overlay**
  - Play / Pause, Next, Previous, Mute, and Intensity slider.
  - Mesh toggle (Plane / Sphere) and Style toggle (Solid / Wireframe).
  - Royalty-free track list with album-style picker.
  - Live level meter and progress bar.
- **Cinematic camera & FX**
  - `OrbitControls` with damping for drag-to-orbit and scroll-to-zoom.
  - Smooth **mouse-reactive camera inertia** layered on top.
  - **Bloom** + **Vignette** post-processing via `@react-three/postprocessing`.
  - Procedural starfield, animated point lights pulsing with bass / mid / treble.
- **Browser-policy-safe**: audio context creation is gated behind a **"Click to Enter"** splash button.
- **Fully responsive**, full-bleed, dark-mode-first design.

## File Architecture

```
app/
  layout.tsx          # Root layout: metadata, dark mode, base styles
  page.tsx            # Server component → mounts VisualizerApp
  globals.css         # Tailwind layers + theme tokens

components/
  VisualizerApp.tsx   # Top-level client component: providers + scene + UI
  Scene.tsx           # R3F Canvas, lights, OrbitControls, Bloom, camera inertia
  VisualizerMesh.tsx  # The deforming sphere/plane (noise + audio displacement)
  ControlsOverlay.tsx # Tailwind UI: transport, mesh/style toggles, track list
  SplashScreen.tsx    # "Click to Enter" gate that initializes audio
  AudioProvider.tsx   # React context wrapping the AudioEngine
  icons.tsx           # Inline SVG icons (no icon library)

lib/
  audio-engine.ts     # AudioEngine class: analyser, frequency bands, transport
  tracks.ts           # Royalty-free track list
  visualizer-store.ts # Tiny pub/sub store shared between DOM UI and R3F loop
```

## Performance Notes

- All Three.js objects are stored on **refs**; nothing inside `useFrame` ever triggers a React re-render.
- Vertex positions are computed from a cached **rest-pose `Float32Array`** so deformation never accumulates drift.
- Sphere extrusion uses pre-computed outward **normals** stored once per geometry mount.
- `AnalyserNode` data is pulled into a single, reused `Uint8Array`; band averages are computed in tight numeric loops.
- The DOM meter / progress UI runs on its own throttled `requestAnimationFrame` loop, fully decoupled from the WebGL render loop.
- `AdaptiveDpr` + `AdaptiveEvents` from drei dial down resolution under load.
- Audio context, listeners, and graph nodes are torn down in the provider's cleanup hook.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **"Click to Enter"**, and the visualizer begins.

> The bundled track list uses the public, royalty-free **SoundHelix** demo songs. Swap them out in `lib/tracks.ts` for your own.

## Production Build

```bash
npm run build
npm run start
```

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript 5
- Tailwind CSS 3
- three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing
- simplex-noise 4 (pure JS, no native deps)

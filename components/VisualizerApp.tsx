"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AudioProvider } from "./AudioProvider";
import { ControlsOverlay } from "./ControlsOverlay";
import { SplashScreen } from "./SplashScreen";

const Scene = dynamic(() => import("./Scene").then((m) => m.Scene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-white/40 label-mono">
      Booting WebGL…
    </div>
  ),
});

export function VisualizerApp() {
  const [entered, setEntered] = useState(false);

  return (
    <AudioProvider>
      <main className="relative h-dvh w-screen overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <Scene />
        </div>

        <div className="absolute inset-0 pointer-events-none noise-overlay" />

        {entered && <ControlsOverlay />}
        {!entered && <SplashScreen onEnter={() => setEntered(true)} />}
      </main>
    </AudioProvider>
  );
}

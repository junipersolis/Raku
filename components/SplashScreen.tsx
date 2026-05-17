"use client";

import { useState } from "react";
import { useAudio } from "./AudioProvider";

export function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const { initialize, play } = useAudio();
  const [busy, setBusy] = useState(false);

  const enter = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await initialize();
      await play();
    } finally {
      onEnter();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900 noise-overlay">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-neon-cyan/20 blur-[120px] animate-pulseGlow" />
        <div className="absolute -bottom-32 -right-32 h-[40rem] w-[40rem] rounded-full bg-neon-pink/20 blur-[120px] animate-pulseGlow" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-neon-violet/20 blur-[140px]" />
      </div>

      <div className="text-center px-8 max-w-2xl">
        <div className="mx-auto mb-8 h-16 w-16 rounded-2xl border border-white/15 bg-gradient-to-br from-neon-cyan/40 via-neon-violet/40 to-neon-pink/40 shadow-glow animate-floaty" />
        <p className="label-mono mb-3">RAKU · audio·visual·OS</p>
        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-tight bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
          Step inside the sound.
        </h1>
        <p className="mt-4 text-white/70 text-base sm:text-lg max-w-xl mx-auto">
          A code-driven, real-time 3D audio visualizer. No assets, no models —
          just shaders, simplex noise, and the Web Audio API.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={enter}
            disabled={busy}
            className="btn-primary px-8 py-3 text-sm tracking-[0.18em] uppercase disabled:opacity-50"
            aria-busy={busy}
          >
            {busy ? "Tuning…" : "Click to Enter"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <span className="chip">Next.js</span>
          <span className="chip">React Three Fiber</span>
          <span className="chip">Tailwind</span>
          <span className="chip">Web Audio</span>
        </div>

        <p className="mt-10 label-mono">
          Tip: drag to orbit · scroll to zoom · move your mouse for parallax
        </p>
      </div>
    </div>
  );
}

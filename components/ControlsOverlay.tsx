"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "./AudioProvider";
import { setState, useVisualizerStore } from "@/lib/visualizer-store";
import {
  ChevronDownIcon,
  MuteIcon,
  MusicIcon,
  NextIcon,
  PauseIcon,
  PlaneIcon,
  PlayIcon,
  PrevIcon,
  SolidIcon,
  SphereIcon,
  VolumeIcon,
  WireIcon,
} from "./icons";

export function ControlsOverlay() {
  const {
    tracks,
    currentTrack,
    toggle,
    next,
    previous,
    toggleMute,
    selectTrack,
    bandsRef,
    engineRef,
  } = useAudio();
  const ui = useVisualizerStore();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const levelBarRef = useRef<HTMLDivElement>(null);

  // Lightweight RAF loop driving DOM-side meters (decoupled from R3F).
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < 60) return;
      last = ts;
      const audio = engineRef.current?.audio;
      if (audio && !Number.isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
        setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0);
      }
      const b = bandsRef.current;
      if (levelBarRef.current) {
        levelBarRef.current.style.transform = `scaleX(${Math.min(1, b.level * 1.6)})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [bandsRef, engineRef]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      {/* Top bar */}
      <header className="pointer-events-auto flex items-start justify-between gap-4 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-xl border border-white/15 bg-gradient-to-br from-neon-cyan/30 via-neon-violet/30 to-neon-pink/30 shadow-glow animate-pulseGlow" />
          <div className="leading-tight">
            <div className="font-display text-sm tracking-[0.32em] text-white/90">
              RAKU
            </div>
            <div className="label-mono">3D Audio Visualizer</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="chip">R3F</span>
          <span className="chip">Web Audio</span>
          <span className="chip">Bloom FX</span>
        </div>
      </header>

      <div className="flex-1" />

      {/* Side controls (visualizer style + mesh) */}
      <div className="pointer-events-none absolute top-1/2 right-5 sm:right-8 -translate-y-1/2 hidden md:flex flex-col gap-3">
        <div className="pointer-events-auto glass rounded-2xl p-2 flex flex-col gap-2">
          <div className="px-2 pt-1 label-mono">Mesh</div>
          <Segmented
            value={ui.meshKind}
            onChange={(v) => setState({ meshKind: v as "plane" | "sphere" })}
            options={[
              { value: "sphere", label: "Sphere", icon: <SphereIcon /> },
              { value: "plane", label: "Plane", icon: <PlaneIcon /> },
            ]}
          />
          <div className="px-2 pt-2 label-mono">Style</div>
          <Segmented
            value={ui.styleKind}
            onChange={(v) =>
              setState({ styleKind: v as "solid" | "wireframe" })
            }
            options={[
              { value: "wireframe", label: "Grid", icon: <WireIcon /> },
              { value: "solid", label: "Solid", icon: <SolidIcon /> },
            ]}
          />
          <div className="px-2 pt-2 label-mono">Intensity</div>
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.05}
            value={ui.intensity}
            onChange={(e) =>
              setState({ intensity: parseFloat(e.target.value) })
            }
            className="w-44 accent-neon-cyan mx-2 mb-2"
          />
        </div>
      </div>

      {/* Bottom dock */}
      <footer className="pointer-events-auto p-4 sm:p-8 flex justify-center">
        <div className="glass w-full max-w-3xl rounded-3xl px-4 sm:px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-neon-cyan/40 via-neon-violet/40 to-neon-pink/40">
              <MusicIcon className="text-white/90" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white/95">
                {currentTrack.title}
              </div>
              <div className="label-mono truncate">
                {currentTrack.artist} · Track {ui.currentTrackIndex + 1} /{" "}
                {tracks.length}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <span className="label-mono">LVL</span>
              <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                <div
                  ref={levelBarRef}
                  className="h-full w-full origin-left bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="label-mono w-10 text-right">
              {fmt(currentTime)}
            </span>
            <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"
                style={{ width: `${Math.min(1, progress) * 100}%` }}
              />
            </div>
            <span className="label-mono w-10">{fmt(duration)}</span>
          </div>

          {/* Transport */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-icon"
              onClick={toggleMute}
              aria-label={ui.isMuted ? "Unmute" : "Mute"}
              title={ui.isMuted ? "Unmute" : "Mute"}
            >
              {ui.isMuted ? <MuteIcon /> : <VolumeIcon />}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-icon"
                onClick={previous}
                aria-label="Previous track"
                title="Previous"
              >
                <PrevIcon />
              </button>
              <button
                type="button"
                className="relative inline-flex items-center justify-center h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30 transition-colors shadow-glow"
                onClick={() => toggle()}
                aria-label={ui.isPlaying ? "Pause" : "Play"}
                title={ui.isPlaying ? "Pause" : "Play"}
              >
                {ui.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={next}
                aria-label="Next track"
                title="Next"
              >
                <NextIcon />
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                className="btn"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="listbox"
              >
                Tracks <ChevronDownIcon />
              </button>
              {open && (
                <div
                  role="listbox"
                  className="absolute right-0 bottom-12 w-72 max-h-72 overflow-auto scrollbar-thin glass rounded-2xl p-1"
                >
                  {tracks.map((t, i) => {
                    const active = i === ui.currentTrackIndex;
                    return (
                      <button
                        key={t.id}
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setOpen(false);
                          selectTrack(i);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors ${
                          active
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/5 text-white/80"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{
                            background: t.accent,
                            boxShadow: `0 0 12px ${t.accent}`,
                          }}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="block truncate text-sm">
                            {t.title}
                          </span>
                          <span className="block truncate label-mono">
                            {t.artist}
                          </span>
                        </span>
                        {active && (
                          <span className="label-mono text-neon-cyan">
                            playing
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile mesh/style toggles */}
          <div className="md:hidden flex items-center justify-between gap-2 -mt-1">
            <Segmented
              value={ui.meshKind}
              onChange={(v) =>
                setState({ meshKind: v as "plane" | "sphere" })
              }
              options={[
                { value: "sphere", label: "Sphere", icon: <SphereIcon /> },
                { value: "plane", label: "Plane", icon: <PlaneIcon /> },
              ]}
            />
            <Segmented
              value={ui.styleKind}
              onChange={(v) =>
                setState({ styleKind: v as "solid" | "wireframe" })
              }
              options={[
                { value: "wireframe", label: "Grid", icon: <WireIcon /> },
                { value: "solid", label: "Solid", icon: <SolidIcon /> },
              ]}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

function fmt(t: number) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors ${
              active
                ? "bg-white/10 text-white shadow-glow"
                : "text-white/70 hover:text-white/90"
            }`}
            aria-pressed={active}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

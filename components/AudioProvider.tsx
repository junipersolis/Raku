"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AudioEngine, type AudioBands } from "@/lib/audio-engine";
import { TRACKS, type Track } from "@/lib/tracks";
import { getState, setState, useVisualizerStore } from "@/lib/visualizer-store";

type AudioContextShape = {
  ready: boolean;
  initialize: () => Promise<void>;
  engineRef: React.MutableRefObject<AudioEngine | null>;
  /** Snapshot of latest computed bands; refreshed once per frame from R3F. */
  bandsRef: React.MutableRefObject<AudioBands>;
  tracks: Track[];
  currentTrack: Track;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  selectTrack: (index: number) => Promise<void>;
  toggleMute: () => void;
};

const Ctx = createContext<AudioContextShape | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);
  const bandsRef = useRef<AudioBands>({
    bass: 0,
    lowMid: 0,
    mid: 0,
    treble: 0,
    level: 0,
  });
  const [ready, setReady] = useState(false);
  const { currentTrackIndex } = useVisualizerStore();

  const currentTrack = TRACKS[currentTrackIndex] ?? TRACKS[0];

  const initialize = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.resume();
      return;
    }
    const engine = new AudioEngine();
    engineRef.current = engine;

    engine.audio.addEventListener("ended", () => {
      const s = getState();
      const nextIdx = (s.currentTrackIndex + 1) % TRACKS.length;
      setState({ currentTrackIndex: nextIdx });
      engine.loadTrack(TRACKS[nextIdx].url);
      engine.play().then(() => setState({ isPlaying: true }));
    });
    engine.audio.addEventListener("play", () =>
      setState({ isPlaying: true }),
    );
    engine.audio.addEventListener("pause", () =>
      setState({ isPlaying: false }),
    );

    engine.loadTrack(currentTrack.url);
    await engine.resume();
    setReady(true);
  }, [currentTrack.url]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const play = useCallback(async () => {
    if (!engineRef.current) await initialize();
    await engineRef.current?.play();
  }, [initialize]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const toggle = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) {
      await initialize();
      await engineRef.current?.play();
      return;
    }
    if (engine.audio.paused) {
      await engine.play();
    } else {
      engine.pause();
    }
  }, [initialize]);

  const selectTrack = useCallback(
    async (index: number) => {
      const clamped = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
      setState({ currentTrackIndex: clamped });
      const engine = engineRef.current;
      if (!engine) {
        await initialize();
      }
      const e = engineRef.current;
      if (!e) return;
      e.loadTrack(TRACKS[clamped].url);
      await e.play();
    },
    [initialize],
  );

  const next = useCallback(
    () => selectTrack(currentTrackIndex + 1),
    [currentTrackIndex, selectTrack],
  );
  const previous = useCallback(
    () => selectTrack(currentTrackIndex - 1),
    [currentTrackIndex, selectTrack],
  );

  const toggleMute = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const next = !engine.isMuted();
    engine.setMuted(next);
    setState({ isMuted: next });
  }, []);

  const value = useMemo<AudioContextShape>(
    () => ({
      ready,
      initialize,
      engineRef,
      bandsRef,
      tracks: TRACKS,
      currentTrack,
      play,
      pause,
      toggle,
      next,
      previous,
      selectTrack,
      toggleMute,
    }),
    [
      ready,
      initialize,
      currentTrack,
      play,
      pause,
      toggle,
      next,
      previous,
      selectTrack,
      toggleMute,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useAudio must be used within an <AudioProvider>");
  }
  return ctx;
}

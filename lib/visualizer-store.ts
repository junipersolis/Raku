"use client";

/**
 * Tiny, dependency-free shared store for cross-component state used by both
 * the DOM UI and the R3F render loop. Subscribers re-render on change, while
 * the R3F frame loop reads `getState()` directly (no React re-render).
 */
import { useEffect, useState } from "react";

export type MeshKind = "plane" | "sphere";
export type StyleKind = "solid" | "wireframe";

export type VisualizerState = {
  isPlaying: boolean;
  isMuted: boolean;
  meshKind: MeshKind;
  styleKind: StyleKind;
  currentTrackIndex: number;
  intensity: number;
};

type Listener = (state: VisualizerState) => void;

const initialState: VisualizerState = {
  isPlaying: false,
  isMuted: false,
  meshKind: "sphere",
  styleKind: "wireframe",
  currentTrackIndex: 0,
  intensity: 1,
};

let state: VisualizerState = { ...initialState };
const listeners = new Set<Listener>();

export function getState(): VisualizerState {
  return state;
}

export function setState(patch: Partial<VisualizerState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useVisualizerStore(): VisualizerState {
  const [snap, setSnap] = useState(state);
  useEffect(() => subscribe(setSnap), []);
  return snap;
}

"use client";

/**
 * AudioEngine
 *
 * Lightweight wrapper around the Web Audio API. Hosts a single HTMLAudioElement
 * source routed through GainNode -> AnalyserNode -> destination. Buffers for
 * frequency / time-domain data are pre-allocated so the R3F render loop can
 * pull bytes every frame without triggering GC pressure.
 *
 * Must be created lazily after a user gesture (browser autoplay policy).
 */
export type AudioBands = {
  /** 0..1 normalized energy in the bass band */
  bass: number;
  /** 0..1 normalized energy in the low-mid band */
  lowMid: number;
  /** 0..1 normalized energy in the mid band */
  mid: number;
  /** 0..1 normalized energy in the high band */
  treble: number;
  /** Average of all bands (0..1) */
  level: number;
};

export class AudioEngine {
  readonly audio: HTMLAudioElement;
  readonly context: AudioContext;
  private readonly source: MediaElementAudioSourceNode;
  private readonly gain: GainNode;
  readonly analyser: AnalyserNode;
  readonly frequencyData: Uint8Array;
  readonly timeData: Uint8Array;

  private _muted = false;
  private _volume = 0.85;

  constructor() {
    const Ctx =
      (typeof window !== "undefined" &&
        ((window as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)) ||
      null;

    if (!Ctx) {
      throw new Error("Web Audio API not supported in this environment.");
    }

    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.preload = "auto";
    this.audio.loop = false;

    this.context = new Ctx();
    this.source = this.context.createMediaElementSource(this.audio);
    this.gain = this.context.createGain();
    this.gain.gain.value = this._volume;

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.82;

    this.source.connect(this.gain);
    this.gain.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async resume() {
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  loadTrack(url: string) {
    if (this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    }
  }

  async play() {
    await this.resume();
    try {
      await this.audio.play();
    } catch (err) {
      console.warn("Audio play() rejected:", err);
    }
  }

  pause() {
    this.audio.pause();
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    this.gain.gain.value = muted ? 0 : this._volume;
  }

  isMuted() {
    return this._muted;
  }

  setVolume(volume: number) {
    this._volume = Math.max(0, Math.min(1, volume));
    if (!this._muted) {
      this.gain.gain.value = this._volume;
    }
  }

  /** Read the latest frequency bytes into the pre-allocated buffer. */
  sample() {
    // The DOM lib's signature is narrowed to Uint8Array<ArrayBuffer>; our
    // backing buffer is just ArrayBuffer in practice, so the cast is safe.
    this.analyser.getByteFrequencyData(
      this.frequencyData as Uint8Array<ArrayBuffer>,
    );
    this.analyser.getByteTimeDomainData(
      this.timeData as Uint8Array<ArrayBuffer>,
    );
  }

  /**
   * Compute averaged bass / mid / treble energy. Uses the most recent
   * sample() output, so callers can sample() once per frame and read bands
   * cheaply multiple times.
   */
  getBands(): AudioBands {
    const data = this.frequencyData;
    const len = data.length;
    if (len === 0) {
      return { bass: 0, lowMid: 0, mid: 0, treble: 0, level: 0 };
    }

    // Logarithmic-ish split across the 0..len bins.
    const bassEnd = Math.floor(len * 0.06);
    const lowMidEnd = Math.floor(len * 0.18);
    const midEnd = Math.floor(len * 0.42);

    let bassSum = 0;
    let lowMidSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < bassEnd; i++) bassSum += data[i];
    for (let i = bassEnd; i < lowMidEnd; i++) lowMidSum += data[i];
    for (let i = lowMidEnd; i < midEnd; i++) midSum += data[i];
    for (let i = midEnd; i < len; i++) trebleSum += data[i];

    const bass = bassSum / Math.max(1, bassEnd) / 255;
    const lowMid = lowMidSum / Math.max(1, lowMidEnd - bassEnd) / 255;
    const mid = midSum / Math.max(1, midEnd - lowMidEnd) / 255;
    const treble = trebleSum / Math.max(1, len - midEnd) / 255;
    const level = (bass + lowMid + mid + treble) / 4;

    return { bass, lowMid, mid, treble, level };
  }

  dispose() {
    try {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    } catch {}
    try {
      this.source.disconnect();
      this.gain.disconnect();
      this.analyser.disconnect();
    } catch {}
    if (this.context.state !== "closed") {
      this.context.close().catch(() => {});
    }
  }
}

export type Track = {
  id: string;
  title: string;
  artist: string;
  url: string;
  accent: string;
};

// Royalty-free demo tracks (SoundHelix samples are commonly used as
// free-to-use audio for development and demos).
export const TRACKS: Track[] = [
  {
    id: "sh-1",
    title: "Nebula Drift",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/audio/examples/SoundHelix-Song-1.mp3",
    accent: "#22e3ff",
  },
  {
    id: "sh-2",
    title: "Photon Pulse",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/audio/examples/SoundHelix-Song-2.mp3",
    accent: "#9b5cff",
  },
  {
    id: "sh-3",
    title: "Quantum Bloom",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/audio/examples/SoundHelix-Song-3.mp3",
    accent: "#ff3df0",
  },
  {
    id: "sh-4",
    title: "Cobalt Horizon",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/audio/examples/SoundHelix-Song-7.mp3",
    accent: "#9bff5c",
  },
  {
    id: "sh-5",
    title: "Lumen Cascade",
    artist: "SoundHelix",
    url: "https://www.soundhelix.com/audio/examples/SoundHelix-Song-10.mp3",
    accent: "#ffb84d",
  },
];

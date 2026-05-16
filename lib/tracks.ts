export type Track = {
  id: string;
  title: string;
  artist: string;
  /** Original upstream URL. Use `trackUrl(track)` to get the playable URL. */
  src: string;
  accent: string;
};

// Royalty-free / Creative Commons demo tracks. Upstream CDNs do not always
// send permissive CORS headers, so audio is routed through our same-origin
// /api/track proxy at runtime to keep the Web Audio Analyser unblocked.
//
// Sources:
//  - Google commondatastorage `codeskulptor-demos` bucket: CC-licensed sample
//    tracks distributed as part of Rice University's CodeSkulptor educational
//    project (https://py3.codeskulptor.org/).
//  - Kozco audio test files: short, freely-distributable demo clips
//    (https://www.kozco.com/tech/soundtests.html).
export const TRACKS: Track[] = [
  {
    id: "sevish",
    title: "_nbsp_",
    artist: "Sevish",
    src: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3",
    accent: "#22e3ff",
  },
  {
    id: "kangaroo",
    title: "The Neverwritten Role Playing Game",
    artist: "Kangaroo MusiQue",
    src: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
    accent: "#9b5cff",
  },
  {
    id: "pyman",
    title: "Pyman Intro",
    artist: "CodeSkulptor",
    src: "https://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/intromusic.ogg",
    accent: "#ff3df0",
  },
  {
    id: "kozco-organ",
    title: "Organ Finale",
    artist: "Kozco",
    src: "https://www.kozco.com/tech/organfinale.mp3",
    accent: "#9bff5c",
  },
  {
    id: "kozco-piano",
    title: "Piano (Cool Edit)",
    artist: "Kozco",
    src: "https://www.kozco.com/tech/piano2-CoolEdit.mp3",
    accent: "#ffb84d",
  },
];

export function trackUrl(track: Track): string {
  return `/api/track?src=${encodeURIComponent(track.src)}`;
}

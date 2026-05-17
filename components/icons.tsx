"use client";

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function PlayIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <path d="M7 5v14l12-7L7 5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <path d="M6 5l10 7-10 7V5z" fill="currentColor" stroke="none" />
      <rect x="17" y="5" width="2" height="14" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PrevIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <path d="M18 5L8 12l10 7V5z" fill="currentColor" stroke="none" />
      <rect x="5" y="5" width="2" height="14" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <svg width="18" height="18" {...base} {...props}>
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" stroke="none" />
      <path d="M16 8a5 5 0 010 8" />
      <path d="M18.5 5.5a9 9 0 010 13" />
    </svg>
  );
}

export function MuteIcon(props: IconProps) {
  return (
    <svg width="18" height="18" {...base} {...props}>
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" stroke="none" />
      <path d="M16 9l5 5M21 9l-5 5" />
    </svg>
  );
}

export function SphereIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="8" ry="3" />
      <path d="M4 12c4-3 12-3 16 0" />
    </svg>
  );
}

export function PlaneIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <path d="M3 17l6-10 5 6 7-4-4 12H3z" />
      <path d="M3 17l9-7 9 7" />
    </svg>
  );
}

export function WireIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4v16M6.5 6.5l11 11M6.5 17.5l11-11" />
    </svg>
  );
}

export function SolidIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.9" stroke="none" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg width="14" height="14" {...base} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <svg width="16" height="16" {...base} {...props}>
      <path d="M9 18V6l12-2v12" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="19" cy="16" r="2" />
    </svg>
  );
}

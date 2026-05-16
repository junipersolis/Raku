import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#05060a",
          800: "#0a0b15",
          700: "#11132a",
        },
        neon: {
          cyan: "#22e3ff",
          violet: "#9b5cff",
          pink: "#ff3df0",
          lime: "#9bff5c",
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(34,227,255,0.35), 0 0 80px rgba(155,92,255,0.25)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

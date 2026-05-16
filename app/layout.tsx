import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAKU // 3D Audio Visualizer",
  description:
    "A high-energy, code-driven 3D audio visualizer built with Next.js, React Three Fiber, and the Web Audio API.",
  applicationName: "RAKU Visualizer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#05060a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-900 text-white antialiased selection:bg-neon-violet/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}

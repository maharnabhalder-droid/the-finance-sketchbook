import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "INKWELL — The Finance Sketchbook for Gen Z",
  description:
    "An interactive 30-day personal finance sketchbook. Simulate every rupee before you commit, watch consequences ripple in real time, and protect your runway.",
  keywords: ["personal finance", "Gen Z budget", "simulator", "finance sketchbook", "runway calculator"],
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="min-h-screen selection:bg-saffron-light selection:text-saffron-dark antialiased">
        {children}
      </body>
    </html>
  );
}

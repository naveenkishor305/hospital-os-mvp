import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Inter,
  Noto_Sans_Devanagari,
} from "next/font/google";

import { BootScreen } from "@/components/system/boot-screen";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nadi — Hospital Operating System",
    template: "%s | Nadi",
  },
  description:
    "A secure, role-aware clinical operations workspace built with the Spine Design System.",
  applicationName: "Nadi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plexMono.variable} ${notoDevanagari.variable}`}
      >
        <BootScreen />
        {children}
      </body>
    </html>
  );
}

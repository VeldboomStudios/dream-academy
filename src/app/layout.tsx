import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dream Academy — Van idee naar fysiek product",
  description:
    "AI-ondersteund educatieplatform voor libraries, scholen en universiteiten. Door Veldboom Studios, Amsterdam Zuidoost.",
  openGraph: {
    title: "Dream Academy",
    description: "Van idee naar fysiek product. AI-ondersteund educatieplatform.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="nl"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-obsidian text-paper font-sans antialiased">{children}</body>
    </html>
  );
}

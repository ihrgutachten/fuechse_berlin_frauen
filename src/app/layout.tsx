import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Füchse Berlin Frauen",
    template: "%s · Füchse Berlin Frauen",
  },
  description:
    "Offizielle Website der Füchse Berlin Frauen — 2. Handball-Bundesliga. Spielplan, Tabelle, Team, Matchday & Fan-Tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${barlow.variable} ${barlowCondensed.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

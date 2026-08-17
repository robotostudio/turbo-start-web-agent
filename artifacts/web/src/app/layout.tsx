import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "Harbour",
  description: "A starter marketing site you can edit with any AI agent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "VitalsFlow — AI-Powered Clinical Triage",
  description:
    "AI-powered predictive triage using HL7 FHIR R4 and the clinically validated NEWS2 protocol. Powered by Gemini 1.5 Flash.",
  keywords: [
    "clinical triage",
    "NEWS2",
    "FHIR",
    "AI healthcare",
    "patient safety",
    "Gemini",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${outfit.variable}`}>
      <body className="h-full bg-slate-950 antialiased overflow-hidden">
        {/* Animated mesh background */}
        <div className="bg-mesh" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

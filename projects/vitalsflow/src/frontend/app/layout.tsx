import type { Metadata } from "next";
import { Inter, Outfit, Public_Sans } from "next/font/google";
import "./globals.css";
import { ClinicalShell } from "@/components/ClinicalShell";

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

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "VitalsFlow — AI Clinical Triage System",
  description: "AI-assisted clinical decision support system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${inter.variable} ${outfit.variable} ${publicSans.variable}`}
    >
      <body className="h-full antialiased" suppressHydrationWarning>
        <ClinicalShell>{children}</ClinicalShell>
      </body>
    </html>
  );
}
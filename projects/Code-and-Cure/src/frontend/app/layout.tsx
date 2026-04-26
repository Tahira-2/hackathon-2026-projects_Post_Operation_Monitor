import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareIT",
  description: "Telehealth workflow platform for solo practitioners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

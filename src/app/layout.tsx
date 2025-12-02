import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layered Intelligence System",
  description: "Real-time insights. Hidden patterns. Strategic advantage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://optinodeiq.com"),
  title: {
    default: "Optinode OI — Optimized Intelligence",
    template: "%s — Optinode OI",
  },
  description:
    "Optinode OI (Optimized Intelligence) is a practical framework for building reliable, explainable decision systems—nodes, workflows, and automations that improve outcomes.",

  openGraph: {
    type: "website",
    title: "Optinode OI — Optimized Intelligence",
    description:
      "A practical framework for building reliable, explainable decision systems—nodes, workflows, and automations that improve outcomes.",
    siteName: "Optinode OI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optinode OI — Optimized Intelligence",
    description:
      "A practical framework for building reliable, explainable decision systems—nodes, workflows, and automations that improve outcomes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function OiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
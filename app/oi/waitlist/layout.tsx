import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/oi/waitlist" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
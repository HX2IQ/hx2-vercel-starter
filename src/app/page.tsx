
import { Metadata } from "next";
import HomeSwitcher from "@/components/ui/HomeSwitcher";

export const metadata: Metadata = {
  title: "HX2 — Layered Intelligence",
  description:
    "Real-time insights. Hidden patterns. Strategic advantage.",
  viewport: "width=device-width, initial-scale=1, user-scalable=no",
};

// ✅ This is a Server Component; just renders the client one.
export default function Page() {
  return <HomeSwitcher />;
}

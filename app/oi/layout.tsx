import type { ReactNode } from "react";
import { ContainerStyle, TopNav } from "./_ui/ui";

export const dynamic = "force-dynamic";

export default function OILayout({ children }: { children: ReactNode }) {
  return (
    <div style={ContainerStyle}>
      <TopNav />
      {children}
      <div style={{ marginTop: 18, opacity: 0.6, fontSize: 12, lineHeight: 1.6 }}>
        © {new Date().getFullYear()} Optinode. OI is the public retail layer. Internal engine remains private.
      </div>
    </div>
  );
}

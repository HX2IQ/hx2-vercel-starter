import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "70px",
          background: "linear-gradient(135deg, #070A12 0%, #0B1220 60%, #111827 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-1px" }}>
          OptinodeIQ
        </div>
        <div style={{ marginTop: 14, fontSize: 26, opacity: 0.78 }}>
          Premium customer layer for HX2 — ship fast, wire live.
        </div>
        <div style={{ marginTop: 40, width: 560, height: 14, borderRadius: 999, background: "linear-gradient(90deg,#7C3AED,#06B6D4,#22C55E)" }} />
        <div style={{ marginTop: 22, fontSize: 16, opacity: 0.70 }}>
          optinodeiq.com
        </div>
      </div>
    ),
    size
  );
}

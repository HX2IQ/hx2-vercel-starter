import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111827, #0B1220)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            background: "linear-gradient(90deg, #7C3AED, #06B6D4, #22C55E)",
            opacity: 0.95,
          }}
        />
      </div>
    ),
    size
  );
}

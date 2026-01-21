"use client";
export default function NeuroNet() {
  // Lightweight neuronet SVG background (no libs, fast, looks premium).
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.20]"
      viewBox="0 0 1200 800"
      fill="none"
    >
      <defs>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(600 350) rotate(90) scale(420 680)">
          <stop stopColor="#22C55E" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#06B6D4" stopOpacity="0.20" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0.14" />
        </radialGradient>
        <linearGradient id="line" x1="140" y1="120" x2="1050" y2="700" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" stopOpacity="0.8"/>
          <stop offset="0.5" stopColor="#06B6D4" stopOpacity="0.7"/>
          <stop offset="1" stopColor="#22C55E" stopOpacity="0.75"/>
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1200" height="800" fill="url(#glow)" />

      {/* links */}
      <path d="M180 170 C 340 80, 520 90, 650 190 S 940 320, 1040 220" stroke="url(#line)" strokeWidth="2" opacity="0.55"/>
      <path d="M220 560 C 380 420, 520 420, 680 520 S 980 710, 1080 560" stroke="url(#line)" strokeWidth="2" opacity="0.5"/>
      <path d="M180 170 C 260 320, 320 420, 420 520 S 650 720, 820 650" stroke="url(#line)" strokeWidth="2" opacity="0.45"/>
      <path d="M1040 220 C 920 340, 860 420, 720 460 S 420 520, 220 560" stroke="url(#line)" strokeWidth="2" opacity="0.35"/>

      {/* nodes */}
      {[
        [180,170],[220,560],[420,520],[650,190],[720,460],[820,650],[1040,220],[1080,560],[520,360],[900,420]
      ].map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="7" fill="#0B1220" opacity="0.9"/>
          <circle cx={x} cy={y} r="6" fill="white" opacity="0.06"/>
          <circle cx={x} cy={y} r="3.5" fill="url(#line)" opacity="0.95"/>
        </g>
      ))}
    </svg>
  );
}


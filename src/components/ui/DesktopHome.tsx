import Brand from "@/components/Brand";
import Link from "next/link";


export default function DesktopHome() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-300/30">
      <Nav />
      <Hero />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <Footer />
    </main>
  );
}


function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur border-b border-white/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="hover:scale-105 transition-transform duration-200">
          <Brand size={32} withWordmark />
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-sm text-yellow-200/80">
          <li><a className="hover:text-yellow-300" href="#features">Features</a></li>
          <li><a className="hover:text-yellow-300" href="#usecases">Use Cases</a></li>
          <li><a className="hover:text-yellow-300" href="#pricing">Pricing</a></li>
          <li><a className="hover:text-yellow-300" href="#about">About</a></li>
        </ul>
        <div className="flex items-center gap-3">
          <a
            href="#get-started"
            className="rounded-full border border-yellow-400/80 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-300 hover:text-black transition"
          >
            Sign in
          </a>
        </div>
      </nav>
    </header>
  );
}


function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-white/5"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(80%_60%_at_50%_35%,#000_20%,transparent_70%)]"
        aria-hidden
      >
        <NeuralBackground />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
        <div>
          <h1 id="hero-title" className="text-5xl font-extrabold leading-tight md:text-6xl">
            <span className="block">Meet Your</span>
            <span className="block">Layered</span>
            <span className="block">Intelligence</span>
            <span className="block">System</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-gray-300">
            Real-time insights. Hidden patterns. Strategic advantage.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#get-started"
              className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 px-6 py-3 font-semibold text-black shadow-lg shadow-yellow-500/20 hover:translate-y-0.5 transition"
            >
              Get Started
            </a>
            <a
              href="#learn-more"
              className="rounded-lg border border-yellow-400/80 px-6 py-3 font-semibold text-yellow-300 hover:bg-yellow-300 hover:text-black transition"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -inset-10 rounded-full bg-cyan-500/5 blur-3xl" aria-hidden />
          <NeuralCluster />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const items = [
    {
      title: "Data Ingestion",
      desc: "Consolidate all your data sources in real time.",
      Icon: IconDatabase,
    },
    {
      title: "Pattern Detection",
      desc: "Identify trends and outliers across domains.",
      Icon: IconGraph,
    },
    {
      title: "Actionable Intelligence",
      desc: "Convert signal into decisions with weighted scoring.",
      Icon: IconBulb,
    },
    {
      title: "Execution",
      desc: "Dashboards, alerts, and automations to act fast.",
      Icon: IconCog,
    },
  ];

  return (
    <section id="features" aria-labelledby="features-title" className="mx-auto max-w-7xl px-6 py-20">
      <h2 id="features-title" className="text-3xl font-bold">How It Works</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ title, desc, Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10">
              <Icon className="h-6 w-6 text-yellow-300" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-200">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-300">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section
      id="usecases"
      className="relative border-y border-white/5 bg-gradient-to-b from-black via-gray-950 to-black"
    >
      <div className="absolute inset-0 opacity-20" aria-hidden>
        <NeuralBackground />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 px-6 py-20 md:grid-cols-2 md:gap-16">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold text-yellow-300">For C-Suite:</h2>
          <p className="mt-3 text-gray-300 text-lg">Anticipate boardroom shifts.</p>

          <h2 className="mt-10 text-3xl font-bold text-yellow-300">For Investors:</h2>
          <p className="mt-3 text-gray-300 text-lg">Map hidden market flows.</p>

          <ul className="mt-8 list-disc space-y-2 pl-6 text-gray-300">
            <li>Unified intelligence dashboard across domains</li>
            <li>Predictive windows & anomaly alerts</li>
            <li>Enterprise-ready security & SOC-friendly logging</li>
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <HeroTile />
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Basic", cta: "Start free trial", featured: false },
    { name: "Pro", cta: "Start free trial", featured: true },
    { name: "Enterprise", cta: "Start free trial", featured: false },
  ];

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="mx-auto max-w-7xl px-6 py-24">
      <h2 id="pricing-title" className="text-3xl font-bold mb-10">Trusted By</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-8 ${
              t.featured
                ? "border-yellow-400/50 bg-yellow-400/5"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <h3 className="text-2xl font-semibold">{t.name}</h3>
            <p className="mt-8 text-yellow-300">{t.cta}</p>
            <a
              href="#get-started"
              className="mt-5 inline-block rounded-lg border border-yellow-400/80 px-5 py-2 font-semibold text-yellow-300 hover:bg-yellow-300 hover:text-black transition"
            >
              Choose {t.name}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center">
        <Link href="/" className="hover:scale-105 transition-transform duration-200">
          <Brand size={28} withWordmark={false} />
        </Link>

        <p className="text-sm text-gray-400">
          © 2025 OptinodeIQ Systems LLC · Version 2.1
        </p>
        <div className="flex gap-6 text-yellow-300">
          <a className="hover:text-yellow-200" href="#privacy">Privacy</a>
          <a className="hover:text-yellow-200" href="#terms">Terms</a>
          <a className="hover:text-yellow-200" href="#support">Support</a>
        </div>
      </div>
    </footer>
  );
}


// function LogoMark(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg width="28" height="28" viewBox="0 0 64 64" aria-label="Brand mark" {...props}>
//       <path d="M32 4l20 12v24L32 60 12 40V16L32 4z" fill="none" stroke="#FACC15" strokeWidth="2.5" />
//       <circle cx="32" cy="32" r="10" fill="#FACC15" opacity="0.2" />
//       <path d="M22 26l10 6 10-6-10 18z" fill="#FACC15" opacity="0.8" />
//     </svg>
//   );
// }

function NeuralBackground() {
  return (
    <svg className="h-full w-full" viewBox="0 0 1200 800" role="img" aria-label="neural background">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)" />
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (i * 29) % 1200;
        const y = (i * 53) % 800;
        return <circle key={i} cx={x} cy={y} r="1.8" fill="#67e8f9" opacity="0.25" />;
      })}
    </svg>
  );
}

function NeuralCluster() {
  const nodes = [
    [40, 30], [140, 70], [240, 50], [180, 150], [280, 140],
    [100, 200], [220, 220], [320, 210], [60, 120], [300, 90],
  ];
  return (
    <svg className="mx-auto block h-[380px] w-[380px]" viewBox="0 0 360 360" role="img" aria-label="neural cluster">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {nodes.map(([x1, y1], i) =>
        nodes.map(([x2, y2], j) =>
          j > i ? (
            <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#67e8f9" strokeOpacity="0.15" strokeWidth="1" />
          ) : null
        )
      )}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="#22d3ee" filter="url(#glow)" />
      ))}
    </svg>
  );
}

function HeroTile() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="absolute -inset-8 -z-10 bg-cyan-500/10 blur-3xl" />
      <p className="text-sm text-gray-300">
        Unified intelligence across domains with real-time anomaly detection and predictive windows.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-white/10 p-4 text-yellow-200/90">H2</div>
        <div className="rounded-xl border border-white/10 p-4 text-yellow-200/90">X2</div>
        <div className="rounded-xl border border-white/10 p-4 text-yellow-200/90">K2</div>
        <div className="rounded-xl border border-white/10 p-4 text-yellow-200/90">AH2</div>
        <div className="rounded-xl border border-white/10 p-4 text-yellow-200/90">L2</div>
        <div className="rounded-xl border border-white/10 p-4 text-yellow-200/90">W2</div>
      </div>
    </div>
  );
}

/* Icons */
function IconDatabase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...props}>
      <ellipse cx="12" cy="5" rx="7" ry="3" fill="currentColor" />
      <path d="M5 5v6c0 1.7 3 3 7 3s7-1.3 7-3V5" fill="currentColor" opacity="0.3" />
      <path d="M5 11v6c0 1.7 3 3 7 3s7-1.3 7-3v-6" fill="currentColor" opacity="0.15" />
    </svg>
  );
}
function IconGraph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...props}>
      <circle cx="5" cy="18" r="2" fill="currentColor" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
      <circle cx="19" cy="6" r="2" fill="currentColor" />
      <path d="M5 18L12 10L19 6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
function IconBulb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...props}>
      <path d="M6 10a6 6 0 1112 0c0 2.2-1.3 3.6-2.3 4.6-.7.7-1.2 1.1-1.2 1.9v.5H9.5v-.5c0-.8-.5-1.2-1.2-1.9C7.3 13.6 6 12.2 6 10z" fill="currentColor" />
      <rect x="9" y="19" width="6" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
function IconCog(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...props}>
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="currentColor" />
      <path d="M21 13.5v-3l-2-.8-.6-1.5 1.2-1.7-2.1-2.1-1.7 1.2-1.5-.6L12 2.9l-3 .1-.8 2-1.5.6-1.7-1.2L2.9 6.5l1.2 1.7-.6 1.5L2 10.5v3l2 .8.6 1.5-1.2 1.7 2.1 2.1 1.7-1.2 1.5.6.8 2h3l.8-2 1.5-.6 1.7 1.2 2.1-2.1-1.2-1.7.6-1.5 2-.8z" fill="currentColor" opacity=".25" />
    </svg>
  );
}

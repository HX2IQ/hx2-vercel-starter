import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Optimized Intelligence (OI) Hub | Optinode",
  description: "Explore Optimized Intelligence (OI): definitions, comparisons, methods, and practical guides for building repeatable decision systems.",
  alternates: { canonical: "/oi" },
};

const items = [
  { slug: "what-is-optimized-intelligence", title: "What is Optimized Intelligence (OI)?", desc: "Definition, principles, and why it’s different from generic AI." },
  { slug: "optimized-intelligence-vs-ai", title: "Optimized Intelligence vs AI", desc: "Outcome-first systems vs output-generation." },
  { slug: "how-optimized-intelligence-works", title: "How Optimized Intelligence Works", desc: "Signal → verify → decide → act → feedback." },
  { slug: "building-nodes-with-optimized-intelligence", title: "Building Nodes with Optimized Intelligence", desc: "How to turn know-how into a reusable node." },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Optimized Intelligence (OI)</h1>
      <p className="mt-4 text-white/75 max-w-2xl">
        OI is a practical framework for turning information into better decisions using verification,
        constraints, and repeatable outputs.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/oi/${item.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-white/70">{item.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retail Product Compare (v1)
 * Public GET endpoint
 */

type ProductKey =
  | "koenig"
  | "plexus"
  | "clearview"
  | "rainx"
  | "windex"
  | "quickdetailer"
  | "ceramic_spray"
  | "soap_water"
  | "microfiber_only";

const PRODUCT: Record<ProductKey, any> = {
  koenig: {
    key: "koenig",
    name: "Koenig Spray Polish",
    category: "multi-surface cleaner + protectant",
    use_cases: [
      "Boat gelcoat / fiberglass",
      "Automotive paint & wheels",
      "House windows, shower doors, stainless",
      "Aviation plexiglass"
    ],
    strengths: [
      "One product for many surfaces",
      "Fast wipe-on / wipe-off",
      "Light protective film"
    ],
    cautions: [
      "Not a heavy correction polish",
      "Use clean microfiber only"
    ]
  },

  plexus: {
    key: "plexus",
    name: "Plexus",
    category: "plastic cleaner/polish",
    use_cases: ["Motorcycle & aviation plastics"],
    strengths: ["Plastic-specific formula"],
    cautions: ["Single-purpose product"]
  },

  rainx: {
    key: "rainx",
    name: "Rain-X",
    category: "water repellent",
    use_cases: ["Automotive windshields"],
    strengths: ["Strong hydrophobic effect"],
    cautions: ["Not a cleaner"]
  }
};

function keyOf(v: string | null): ProductKey | null {
  if (!v) return null;
  const k = v.toLowerCase().replace(/[\s-]+/g, "_");
  return (k in PRODUCT) ? (k as ProductKey) : null;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const left = keyOf(u.searchParams.get("left")) || "koenig";
  const right = keyOf(u.searchParams.get("right"));

  if (!right) {
    return NextResponse.json({
      ok: true,
      mode: "discovery",
      products: Object.values(PRODUCT)
    });
  }

  if (left === right) {
    return NextResponse.json({ ok: false, error: "same_product" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    left: PRODUCT[left],
    right: PRODUCT[right],
    ts: new Date().toISOString()
  });
}

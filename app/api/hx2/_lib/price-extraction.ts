export type PriceExtractionResult = {
  found: boolean;
  value: string | null;
  confidence: "low" | "medium" | "high";
};

function normalizePriceValue(raw: string): number | null {
  const n = Number(String(raw || "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return null;
  return n;
}

function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

function isUsablePrice(n: number): boolean {
  if (!Number.isFinite(n)) return false;
  if (n <= 0) return false;
  if (n < 1) return false;
  return true;
}

export function extractLikelyPrice(text: string): PriceExtractionResult {
  const raw = String(text || "");

  if (!raw.trim()) {
    return { found: false, value: null, confidence: "low" };
  }

  const labeledPatterns: Array<{ regex: RegExp; confidence: "high" | "medium" }> = [
    { regex: /sale price:\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i, confidence: "high" },
    { regex: /now:\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i, confidence: "high" },
    { regex: /price:\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i, confidence: "high" },
    { regex: /our price:\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i, confidence: "high" },
    { regex: /msrp:\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i, confidence: "medium" },
    { regex: /was:\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i, confidence: "medium" }
  ];

  for (const p of labeledPatterns) {
    const m = raw.match(p.regex);
    if (m && m[1]) {
      const n = normalizePriceValue(m[1]);
      if (n !== null && isUsablePrice(n)) {
        return { found: true, value: formatPrice(n), confidence: p.confidence };
      }
    }
  }

  const genericMatches = [...raw.matchAll(/\$\s*([0-9]+(?:\.[0-9]{2})?)/gi)];

  const genericCandidates: number[] = [];
  for (const m of genericMatches) {
    const n = normalizePriceValue(m[1]);
    if (n !== null && isUsablePrice(n)) {
      genericCandidates.push(n);
    }
  }

  if (genericCandidates.length === 0) {
    return { found: false, value: null, confidence: "low" };
  }

  const preferred = genericCandidates.find((n) => n >= 5) ?? genericCandidates[0];
  return {
    found: true,
    value: formatPrice(preferred),
    confidence: "low",
  };
}

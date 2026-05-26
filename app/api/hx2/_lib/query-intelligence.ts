import { getThresholdConfig } from "./threshold-config";
export type Hx2QueryClassification =
  | "product_review"
  | "general"
  | "price_lookup"
  | "technical_military"
  | "medical_high_risk";

export function classifyQuery(query: string): Hx2QueryClassification {
  const m = String(query || "").toLowerCase().trim();

  if (/(how much|price|cost|live price|current price|pricing|what does .* cost|how much does .* cost)/.test(m)) {
    return "price_lookup";
  }

  if (/(review|reviews|polish|cleaner|product|buy|purchase|shop|amazon)/.test(m)) {
    return "product_review";
  }

  if (/(drone|ammo|ammunition|weapon|military|missile|combat|war)/.test(m)) {
    return "technical_military";
  }

  if (/(medical|health|disease|treatment|symptom|doctor|drug|medicine)/.test(m)) {
    return "medical_high_risk";
  }

  return "general";
}

export function getMinSaveScore(query: string): number {
  return getThresholdConfig(classifyQuery(query)).minSaveScore;
}

export function getMinLocalMatchScore(query: string): number {
  return getThresholdConfig(classifyQuery(query)).minLocalMatchScore;
}

export function getMinLocalQualityScore(query: string): number {
  return getThresholdConfig(classifyQuery(query)).minLocalQualityScore;
}




export function getMinLocalTokenOverlap(query: string): number {
  return getThresholdConfig(classifyQuery(query)).minLocalTokenOverlap;
}




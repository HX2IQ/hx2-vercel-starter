export type QueryClass =
  | "product_review"
  | "technical_military"
  | "medical_high_risk"
  | "general"
  | "price_lookup";

export function normalizeQueryClass(queryClass: string): QueryClass {
  switch (String(queryClass || "").trim()) {
    case "product_review":
      return "product_review";
    case "technical_military":
      return "technical_military";
    case "medical_high_risk":
      return "medical_high_risk";
    case "price_lookup":
      return "price_lookup";
    default:
      return "general";
  }
}

export function getThresholdConfig(queryClass: string) {
  const qc = normalizeQueryClass(queryClass);

  switch (qc) {
    case "price_lookup":
      return {
        minSaveScore: 10,
        minLocalMatchScore: 25,
        minLocalQualityScore: 10,
        minLocalTokenOverlap: 0,
      };

    case "product_review":
      return {
        minSaveScore: 10,
        minLocalMatchScore: 25,
        minLocalQualityScore: 10,
        minLocalTokenOverlap: 1,
      };

    case "technical_military":
      return {
        minSaveScore: 15,
        minLocalMatchScore: 25,
        minLocalQualityScore: 10,
        minLocalTokenOverlap: 0,
      };

    case "medical_high_risk":
      return {
        minSaveScore: 18,
        minLocalMatchScore: 25,
        minLocalQualityScore: 10,
        minLocalTokenOverlap: 0,
      };

    default:
      return {
        minSaveScore: 10,
        minLocalMatchScore: 25,
        minLocalQualityScore: 10,
        minLocalTokenOverlap: 0,
      };
  }
}

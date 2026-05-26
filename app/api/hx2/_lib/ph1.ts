export type Ph1Input = {
  user_query?: string;
};

export type Ph1Score = {
  name: string;
  score: number;
  reason: string;
};

export type Ph1Result = {
  node_id: "ph1";
  node_label: string;
  purpose: string;
  status: "active_v1";
  query_type: "ingredient_label" | "product_review" | "general";
  summary: string;
  composite_score: number;
  verdict: "clean" | "mostly_clean" | "caution" | "dirty";
  scores: Ph1Score[];
  flags: string[];
  suggestions: string[];
  confidence: "low" | "medium" | "high";
  limitations: string[];
  received_input_keys: string[];
};

function clampScore(value: number) {
  if (value < 1) return 1;
  if (value > 10) return 10;
  return Math.round(value);
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function countMatches(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term)).length;
}

const dirtyTerms = [
  "sucralose", "acesulfame", "acesulfame k", "artificial flavor",
  "corn syrup", "high fructose corn syrup", "seed oil", "soybean oil",
  "canola oil", "red 40", "yellow 5", "yellow 6", "blue 1",
  "dye", "maltodextrin", "msg"
];

const cautionTerms = [
  "natural flavor", "gum", "lecithin", "citric acid",
  "preservative", "stabilizer", "silicon dioxide", "proprietary blend"
];

const positiveTerms = [
  "grass fed", "grass-fed", "whey isolate", "egg white", "collagen",
  "electrolyte", "magnesium", "creatine", "cocoa", "sea salt"
];

function detectQueryType(text: string): Ph1Result["query_type"] {
  if (hasAny(text, ["ingredient", "ingredients", "label", "contains", "nutrition facts"])) {
    return "ingredient_label";
  }

  if (hasAny(text, ["product", "powder", "drink", "bar", "capsule", "supplement"])) {
    return "product_review";
  }

  return "general";
}

function buildScores(text: string): Ph1Score[] {
  let ingredientCleanliness = 8;
  let additiveBurden = 8;
  let metabolicFriendliness = 7;
  let labelTransparency = 7;
  let safetyMargin = 7;

  const dirtyHits = countMatches(text, dirtyTerms);
  const cautionHits = countMatches(text, cautionTerms);
  const positiveHits = countMatches(text, positiveTerms);

  ingredientCleanliness -= dirtyHits * 2;
  ingredientCleanliness -= cautionHits;
  ingredientCleanliness += positiveHits >= 2 ? 1 : 0;

  additiveBurden -= dirtyHits * 2;
  additiveBurden -= cautionHits;

  metabolicFriendliness -= hasAny(text, ["sugar", "corn syrup", "maltodextrin", "sucralose"]) ? 2 : 0;
  metabolicFriendliness += hasAny(text, ["protein", "creatine", "electrolyte", "magnesium"]) ? 1 : 0;

  labelTransparency -= hasAny(text, ["natural flavor", "proprietary blend"]) ? 2 : 0;

  safetyMargin -= dirtyHits >= 2 ? 2 : 0;
  safetyMargin -= hasAny(text, ["dye", "msg", "high fructose corn syrup"]) ? 1 : 0;

  return [
    {
      name: "Ingredient Cleanliness",
      score: clampScore(ingredientCleanliness),
      reason: "Estimates how clean or junk-heavy the ingredient profile appears from the text."
    },
    {
      name: "Additive Burden",
      score: clampScore(additiveBurden),
      reason: "Estimates how many unnecessary additives, sweeteners, colors, or processing aids appear in the text."
    },
    {
      name: "Metabolic Friendliness",
      score: clampScore(metabolicFriendliness),
      reason: "Estimates whether the described product is likely to support stable energy and cleaner intake."
    },
    {
      name: "Label Transparency",
      score: clampScore(labelTransparency),
      reason: "Estimates how transparent the ingredient wording appears."
    },
    {
      name: "Safety Margin",
      score: clampScore(safetyMargin),
      reason: "Estimates the caution level warranted by the ingredient profile."
    }
  ];
}

function computeCompositeScore(scores: Ph1Score[]) {
  const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  return clampScore(avg);
}

function detectVerdict(score: number): Ph1Result["verdict"] {
  if (score >= 8) return "clean";
  if (score >= 6) return "mostly_clean";
  if (score >= 4) return "caution";
  return "dirty";
}

function buildFlags(text: string): string[] {
  const flags: string[] = [];

  if (hasAny(text, dirtyTerms)) {
    flags.push("Problematic additive or junk-ingredient wording detected");
  }

  if (hasAny(text, ["natural flavor", "proprietary blend"])) {
    flags.push("Opaque ingredient wording detected");
  }

  if (hasAny(text, ["red 40", "yellow 5", "yellow 6", "blue 1", "dye"])) {
    flags.push("Artificial color / dye wording detected");
  }

  if (hasAny(text, ["sucralose", "acesulfame", "corn syrup", "high fructose corn syrup"])) {
    flags.push("Sweetener / sugar-processing concern detected");
  }

  return flags;
}

function buildSuggestions(queryType: Ph1Result["query_type"], text: string): string[] {
  const suggestions: string[] = [];

  if (queryType === "ingredient_label") {
    suggestions.push("Paste the full ingredient list exactly as written for the best result.");
    suggestions.push("Include serving size and nutrition facts if available.");
  }

  if (queryType === "product_review") {
    suggestions.push("Include the complete label text, not just the product name.");
    suggestions.push("List whether the product is powder, capsule, bar, or drink.");
  }

  if (hasAny(text, dirtyTerms)) {
    suggestions.push("Look for a simpler alternative with fewer sweeteners, dyes, or processing aids.");
  }

  if (hasAny(text, ["natural flavor", "proprietary blend"])) {
    suggestions.push("Favor products with clearer ingredient disclosure and fewer umbrella terms.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Paste the exact ingredient label for a sharper product-hygiene review.");
  }

  return suggestions;
}

function detectConfidence(queryType: Ph1Result["query_type"], text: string): Ph1Result["confidence"] {
  if (queryType !== "general" && text.length > 160) return "high";
  if (queryType !== "general" && text.length > 80) return "medium";
  return "low";
}

function buildSummary(
  queryType: Ph1Result["query_type"],
  compositeScore: number,
  verdict: Ph1Result["verdict"],
  flags: string[]
) {
  if (queryType === "ingredient_label") {
    return `PH1 sees this primarily as an ingredient-label question. First-pass composite score: ${compositeScore}/10 with a ${verdict.replaceAll("_", " ")} read. ${flags.length > 0 ? "Flagged ingredient concerns were detected." : ""}`.trim();
  }

  if (queryType === "product_review") {
    return `PH1 sees this primarily as a product-review question. First-pass composite score: ${compositeScore}/10 with a ${verdict.replaceAll("_", " ")} read. Full label text would improve precision.`;
  }

  return `PH1 processed the product query successfully. First-pass composite score: ${compositeScore}/10 with a ${verdict.replaceAll("_", " ")} read.`;
}

export function runPh1Analysis(input: Ph1Input): Ph1Result {
  const userQuery = (input.user_query || "").trim();
  const text = userQuery.toLowerCase();

  const queryType = detectQueryType(text);
  const scores = buildScores(text);
  const compositeScore = computeCompositeScore(scores);
  const verdict = detectVerdict(compositeScore);
  const flags = buildFlags(text);
  const suggestions = buildSuggestions(queryType, text);
  const confidence = detectConfidence(queryType, text);

  return {
    node_id: "ph1",
    node_label: "Product Hygiene Intelligence 1",
    purpose: "Analyze ingredient labels and product text for cleanliness, additive burden, and label transparency.",
    status: "active_v1",
    query_type: queryType,
    summary: buildSummary(queryType, compositeScore, verdict, flags),
    composite_score: compositeScore,
    verdict,
    scores,
    flags,
    suggestions,
    confidence,
    limitations: [
      "This is a first-pass rule-based product-label analysis.",
      "Results depend on the completeness of the ingredient text provided.",
      "This output is not a substitute for allergy screening or medical advice."
    ],
    received_input_keys: Object.keys(input || {})
  };
}

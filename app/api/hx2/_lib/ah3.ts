export type Ah3Input = {
  user_query?: string;
};

export type Ah3Score = {
  name: string;
  score: number;
  reason: string;
};

export type Ah3Cause = {
  cause: string;
  likelihood: "high" | "medium" | "low";
  mechanism: string;
};

export type Ah3Action = {
  priority: "immediate" | "next" | "optional";
  action: string;
  why: string;
};

export type Ah3Result = {
  node_id: "ah3";
  node_label: string;
  purpose: string;
  status: "active_v2_ah2_mode";
  mode: "AH2_FUNCTIONAL_MECHANISM_FIRST";
  query_type: "supplement" | "symptom" | "product" | "protocol" | "mixed" | "general";
  summary: string;
  composite_score: number;
  verdict: "strong" | "usable_with_caution" | "caution" | "high_caution";
  scores: Ah3Score[];
  mechanism: string[];
  likely_causes: Ah3Cause[];
  actions: Ah3Action[];
  avoid: string[];
  red_flags: string[];
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

const supplementTerms = [
  "supplement", "vitamin", "mineral", "nac", "magnesium", "creatine", "berberine",
  "turmeric", "probiotic", "zinc", "iodine", "nmn", "resveratrol", "coq10",
  "glycine", "chlorella", "quercetin", "cod liver oil"
];

const symptomTerms = [
  "symptom", "pain", "rash", "itch", "tired", "fatigue", "dizzy", "lightheaded",
  "weak", "nausea", "headache", "palpitation", "irregular heart", "heart racing",
  "cramp", "bloat", "reaction", "passing out", "fainting", "shortness of breath",
  "chest pain", "shaky", "head rush", "tunnel vision"
];

const productTerms = [
  "ingredient", "label", "product", "powder", "capsule", "drink", "bar",
  "rx bar", "protein", "formula", "contains", "serving size"
];

const protocolTerms = [
  "protocol", "routine", "stack", "regimen", "cycle", "fast", "fasting",
  "water fast", "schedule", "take with", "take before", "take after",
  "empty stomach", "before bed", "with food"
];

const redFlagTerms = [
  "passing out", "fainting", "chest pain", "shortness of breath",
  "irregular heart", "heart racing", "palpitation", "tunnel vision"
];

const fastingTerms = [
  "fast", "fasting", "water fast", "empty stomach", "no food"
];

function detectQueryType(text: string): Ah3Result["query_type"] {
  const hasSupplement = hasAny(text, supplementTerms);
  const hasSymptom = hasAny(text, symptomTerms);
  const hasProduct = hasAny(text, productTerms);
  const hasProtocol = hasAny(text, protocolTerms);

  const matches = [hasSupplement, hasSymptom, hasProduct, hasProtocol].filter(Boolean).length;

  if (matches > 1) return "mixed";
  if (hasSymptom) return "symptom";
  if (hasSupplement) return "supplement";
  if (hasProduct) return "product";
  if (hasProtocol) return "protocol";
  return "general";
}

function buildScores(queryType: Ah3Result["query_type"], text: string): Ah3Score[] {
  let cleanliness = 8;
  let metabolicFit = 7;
  let inflammatoryLoad = 8;
  let practicality = 7;
  let safetyMargin = 7;

  const symptomHits = countMatches(text, symptomTerms);
  const redFlagHits = countMatches(text, redFlagTerms);
  const fastingHits = countMatches(text, fastingTerms);

  if (hasAny(text, ["sugar", "corn syrup", "seed oil", "artificial", "sucralose", "dye"])) {
    cleanliness -= 3;
    inflammatoryLoad -= 2;
  }

  if (hasAny(text, ["protein", "creatine", "electrolyte", "magnesium", "nac", "berberine"])) {
    metabolicFit += 1;
  }

  if (hasAny(text, ["water fast", "fasting", "empty stomach"])) {
    metabolicFit -= 1;
    safetyMargin -= 1;
  }

  if (hasAny(text, ["dizzy", "lightheaded", "weak", "fatigue", "tired", "shaky", "head rush"])) {
    safetyMargin -= 2;
    metabolicFit -= 1;
  }

  if (redFlagHits > 0) {
    safetyMargin -= 3;
  }

  if (symptomHits >= 2) {
    safetyMargin -= 1;
  }

  if (fastingHits >= 1 && symptomHits >= 1) {
    safetyMargin -= 1;
  }

  if (queryType === "symptom") {
    safetyMargin -= 1;
  }

  return [
    {
      name: "Cleanliness",
      score: clampScore(cleanliness),
      reason: "Rates whether the compounds or inputs appear clean versus additive-heavy."
    },
    {
      name: "Metabolic Fit",
      score: clampScore(metabolicFit),
      reason: "Rates whether the stack fits the metabolic state described, especially fasting or low-fuel context."
    },
    {
      name: "Inflammatory Load",
      score: clampScore(inflammatoryLoad),
      reason: "Rates likely inflammatory burden from the described stack or product."
    },
    {
      name: "Practicality",
      score: clampScore(practicality),
      reason: "Rates whether the protocol is easy to follow safely and consistently."
    },
    {
      name: "Safety Margin",
      score: clampScore(safetyMargin),
      reason: "Rates caution level based on symptoms, fasting state, red flags, and stacking risk."
    }
  ];
}

function computeCompositeScore(scores: Ah3Score[]) {
  const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  return clampScore(avg);
}

function getScore(scores: Ah3Score[], name: string) {
  return scores.find((s) => s.name === name)?.score ?? 0;
}

function detectVerdict(compositeScore: number, scores: Ah3Score[]): Ah3Result["verdict"] {
  const safetyMargin = getScore(scores, "Safety Margin");

  let verdict: Ah3Result["verdict"];
  if (compositeScore >= 8) verdict = "strong";
  else if (compositeScore >= 6) verdict = "usable_with_caution";
  else if (compositeScore >= 4) verdict = "caution";
  else verdict = "high_caution";

  if (safetyMargin <= 3) return "high_caution";
  if (safetyMargin <= 4 && (verdict === "strong" || verdict === "usable_with_caution")) return "caution";

  return verdict;
}

function buildMechanism(text: string): string[] {
  const mechanisms: string[] = [];

  if (hasAny(text, fastingTerms)) {
    mechanisms.push("Fasting lowers insulin, and lower insulin often increases sodium and water loss through the kidneys.");
    mechanisms.push("Lower sodium and fluid volume can reduce blood pressure, especially when standing or moving quickly.");
  }

  if (hasAny(text, ["magnesium"])) {
    mechanisms.push("Magnesium can relax blood vessels and support vasodilation, which may feel good normally but can worsen lightheadedness during fasting or low-sodium states.");
  }

  if (hasAny(text, ["creatine"])) {
    mechanisms.push("Creatine increases water demand and can pull more water into muscle tissue, so hydration and electrolytes matter more during fasting.");
  }

  if (hasAny(text, ["nac"])) {
    mechanisms.push("NAC can affect oxidative stress and blood-flow signaling; in a fasted state, some people notice tolerance shifts when combined with low fuel or low electrolytes.");
  }

  if (hasAny(text, ["dizzy", "lightheaded", "weak", "head rush", "shaky"])) {
    mechanisms.push("Dizziness during fasting usually points first to blood pressure, hydration, sodium, or fuel-transition issues rather than a random detox reaction.");
  }

  if (mechanisms.length === 0) {
    mechanisms.push("AH2 mechanism layer needs more timing, dose, symptom, and context detail to build a strong causal chain.");
  }

  return mechanisms;
}

function buildLikelyCauses(text: string): Ah3Cause[] {
  const causes: Ah3Cause[] = [];

  if (hasAny(text, fastingTerms) && hasAny(text, ["dizzy", "lightheaded", "weak", "head rush"])) {
    causes.push({
      cause: "Electrolyte and fluid-volume drop",
      likelihood: "high",
      mechanism: "Fasting can increase sodium and water loss, lowering blood pressure and causing dizziness or head rush."
    });

    causes.push({
      cause: "Orthostatic blood-pressure dip",
      likelihood: "high",
      mechanism: "Low sodium, lower plasma volume, magnesium-related vasodilation, and standing up can combine into lightheadedness."
    });

    causes.push({
      cause: "Low-glucose / ketone-transition mismatch",
      likelihood: "medium",
      mechanism: "During early fasting, glucose can drop before ketone supply feels stable, creating temporary brain-fuel mismatch."
    });
  }

  if (hasAny(text, ["creatine"]) && hasAny(text, fastingTerms)) {
    causes.push({
      cause: "Higher hydration demand from creatine during fasting",
      likelihood: "medium",
      mechanism: "Creatine is usually useful, but during fasting it increases the importance of water and electrolytes."
    });
  }

  if (causes.length === 0) {
    causes.push({
      cause: "Incomplete input detail",
      likelihood: "medium",
      mechanism: "The prompt does not include enough timing, dose, hydration, food, caffeine, or symptom sequence to isolate a root cause."
    });
  }

  return causes;
}

function buildActions(text: string): Ah3Action[] {
  const actions: Ah3Action[] = [];

  if (hasAny(text, fastingTerms) && hasAny(text, ["dizzy", "lightheaded", "weak", "head rush", "shaky"])) {
    actions.push({
      priority: "immediate",
      action: "Add electrolytes before blaming the supplements.",
      why: "A fasting-related sodium and fluid drop is the most likely first mechanism behind dizziness."
    });

    actions.push({
      priority: "immediate",
      action: "Use salt water or a clean no-sugar electrolyte mix during the fast.",
      why: "Sodium support can restore circulating volume and improve blood-pressure stability."
    });

    actions.push({
      priority: "next",
      action: "Move magnesium away from the fasted window, preferably later or with food if tolerated.",
      why: "Magnesium can lower vascular tone and may worsen lightheadedness when sodium is low."
    });

    actions.push({
      priority: "next",
      action: "Take creatine with food or ensure higher water and electrolytes if taken while fasting.",
      why: "Creatine raises hydration demand and works better when fluid/electrolyte status is stable."
    });

    actions.push({
      priority: "next",
      action: "Test variables one at a time: fast without the stack, then reintroduce one supplement at a time.",
      why: "Isolation is the fastest way to separate fasting physiology from supplement intolerance."
    });
  }

  if (actions.length === 0) {
    actions.push({
      priority: "next",
      action: "Provide exact doses, timing, food state, hydration, caffeine, and symptom timing.",
      why: "AH2 needs sequence detail to move from general scoring to sharper causal analysis."
    });
  }

  return actions;
}

function buildAvoid(text: string): string[] {
  const avoid: string[] = [];

  if (hasAny(text, ["dizzy", "lightheaded", "weak", "head rush", "shaky"])) {
    avoid.push("Do not ignore dizziness or push through it as a detox sign.");
    avoid.push("Do not keep adding new supplements while symptoms are active.");
  }

  if (hasAny(text, fastingTerms)) {
    avoid.push("Do not stack multiple supplements fasted again without electrolytes and hydration accounted for.");
    avoid.push("Do not assume a fasting protocol is working better just because symptoms feel intense.");
  }

  if (avoid.length === 0) {
    avoid.push("Do not overinterpret a broad prompt without exact dose and timing details.");
  }

  return avoid;
}

function buildRedFlags(text: string): string[] {
  const redFlags: string[] = [];

  if (hasAny(text, ["chest pain"])) redFlags.push("Chest pain");
  if (hasAny(text, ["shortness of breath"])) redFlags.push("Shortness of breath");
  if (hasAny(text, ["fainting", "passing out"])) redFlags.push("Fainting or passing out");
  if (hasAny(text, ["heart racing", "palpitation", "irregular heart"])) redFlags.push("Heart racing, palpitations, or irregular heartbeat");
  if (hasAny(text, ["tunnel vision"])) redFlags.push("Tunnel vision or near-fainting");

  if (hasAny(text, ["dizzy", "lightheaded", "weak", "head rush"])) {
    redFlags.push("Dizziness that worsens, repeats, or appears when standing");
  }

  return redFlags;
}

function buildFlags(text: string): string[] {
  const flags: string[] = [];

  if (hasAny(text, ["dizzy", "lightheaded", "weak", "fatigue", "tired", "head rush", "shaky"])) {
    flags.push("Symptom-oriented query detected");
    flags.push("Possible low-fuel / low-sodium / low-blood-pressure pattern detected");
  }

  if (hasAny(text, redFlagTerms)) {
    flags.push("Red-flag cardiovascular or near-fainting wording detected");
  }

  if (hasAny(text, fastingTerms)) {
    flags.push("Fasting context materially changes supplement tolerance");
  }

  if (hasAny(text, ["stack", "regimen", "protocol", "routine"]) || countMatches(text, supplementTerms) >= 2) {
    flags.push("Multi-input stack/protocol context detected");
  }

  return flags;
}

function buildSuggestions(text: string): string[] {
  const suggestions: string[] = [];

  if (hasAny(text, fastingTerms) && hasAny(text, ["dizzy", "lightheaded", "weak", "head rush", "shaky"])) {
    suggestions.push("First suspect electrolytes and blood pressure, not detox.");
    suggestions.push("Track standing symptoms: head rush, tunnel vision, weakness, shakiness, or heart racing.");
    suggestions.push("List exact supplement doses and timing so the stack can be optimized.");
  }

  suggestions.push("Include hydration, salt intake, caffeine, last meal timing, and whether symptoms happened standing or sitting.");

  return suggestions;
}

function buildSummary(queryType: Ah3Result["query_type"], compositeScore: number, verdict: Ah3Result["verdict"], scores: Ah3Score[]) {
  const safety = getScore(scores, "Safety Margin");

  return `AH2 mechanism-first read: this is a ${queryType} query with a ${compositeScore}/10 composite and a ${verdict.replaceAll("_", " ")} verdict. Safety Margin is ${safety}/10, so symptoms matter more than the raw cleanliness of the supplements.`;
}

function detectConfidence(queryType: Ah3Result["query_type"], text: string): Ah3Result["confidence"] {
  if (queryType !== "general" && text.length > 160) return "high";
  if (queryType !== "general" && text.length > 70) return "medium";
  return "low";
}

export function runAh3Analysis(input: Ah3Input): Ah3Result {
  const userQuery = (input.user_query || "").trim();
  const text = userQuery.toLowerCase();

  const queryType = detectQueryType(text);
  const scores = buildScores(queryType, text);
  const compositeScore = computeCompositeScore(scores);
  const verdict = detectVerdict(compositeScore, scores);
  const flags = buildFlags(text);
  const mechanism = buildMechanism(text);
  const likelyCauses = buildLikelyCauses(text);
  const actions = buildActions(text);
  const avoid = buildAvoid(text);
  const redFlags = buildRedFlags(text);
  const suggestions = buildSuggestions(text);
  const confidence = detectConfidence(queryType, text);

  return {
    node_id: "ah3",
    node_label: "Advanced Health Intelligence 3",
    purpose: "Analyze supplements, symptoms, products, and protocols using AH2 functional, mechanism-first scoring.",
    status: "active_v2_ah2_mode",
    mode: "AH2_FUNCTIONAL_MECHANISM_FIRST",
    query_type: queryType,
    summary: buildSummary(queryType, compositeScore, verdict, scores),
    composite_score: compositeScore,
    verdict,
    scores,
    mechanism,
    likely_causes: likelyCauses,
    actions,
    avoid,
    red_flags: redFlags,
    flags,
    suggestions,
    confidence,
    limitations: [
      "This is functional mechanism-first analysis, not a medical diagnosis.",
      "Severe, recurring, or cardiovascular symptoms should be treated as higher priority than supplement optimization.",
      "Precision depends on exact timing, doses, hydration, electrolytes, food intake, and symptom sequence."
    ],
    received_input_keys: Object.keys(input || {})
  };
}

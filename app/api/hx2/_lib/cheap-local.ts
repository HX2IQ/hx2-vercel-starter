export function getCheapLocalAnswer(query: string) {
  const q = (query || "").toLowerCase().trim();

  const simpleDefinition =
    /^(what is|what are|define|meaning of|explain)\b/.test(q);

  if (/creatine/.test(q) && /safe|daily|every day/.test(q)) {
    return {
      answer: "Creatine is generally safe daily for many healthy adults. Typical use is 3–5g/day. Use caution with kidney disease.",
      synth_version: "v1_health_fastpath"
    };
  }

  if (/magnesium/.test(q) && /night|nightly|daily|safe/.test(q)) {
    return {
      answer: "Magnesium is commonly used nightly. Many prefer glycinate. Too much may loosen stools.",
      synth_version: "v1_health_fastpath"
    };
  }

  if (/age garlic|aged garlic|kyolic/.test(q) && simpleDefinition) {
    return {
      answer: "AGE garlic means Aged Garlic Extract, a garlic supplement aged to create stable beneficial compounds and reduce harsh odor.",
      synth_version: "v1_fact_fastpath"
    };
  }

  return null;
}

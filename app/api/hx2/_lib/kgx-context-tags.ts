export function buildKgxContextTags(userRequest: string) {
  const q = userRequest.toLowerCase();

  const tags: string[] = [];

  const rules = [
    { tag: "travel", terms: ["travel", "trip", "vacation", "cruise", "flight", "hotel"] },
    { tag: "cruise", terms: ["cruise", "ship", "port", "excursion"] },
    { tag: "mediterranean", terms: ["mediterranean", "barcelona", "rome", "italy", "spain", "greece"] },
    { tag: "family", terms: ["family", "wife", "child", "kids", "son"] },
    { tag: "health", terms: ["health", "medical", "vitamin", "supplement", "diet"] },
    { tag: "legal", terms: ["legal", "contract", "trademark", "patent", "compliance"] },
    { tag: "marketing", terms: ["marketing", "seo", "ads", "campaign", "landing page"] },
    { tag: "finance", terms: ["crypto", "stock", "market", "investment", "xrp"] },
    { tag: "buildops", terms: ["sprint", "build", "typescript", "vercel", "deploy"] }
  ];

  for (const rule of rules) {
    if (rule.terms.some(term => q.includes(term))) {
      tags.push(rule.tag);
    }
  }

  return {
    contextual_reinforcement_tags_active: true,
    tags: Array.from(new Set(tags))
  };
}

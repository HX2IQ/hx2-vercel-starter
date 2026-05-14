export function classifyIntent(query: string) {
  const q = (query || "").toLowerCase();

  if (/deploy|build|patch|debug|compile|vercel|route|routing|ship|sprint next|error|failed/.test(q)) {
    return "builder";
  }

  if (/health|supplement|vitamin|garlic|creatine|magnesium|berberine|symptom|dose|safe daily|blood pressure/.test(q)) {
    return "health";
  }

  if (/marketing|sales|seo|business|revenue|pricing|affiliate|conversion|customer|lead|leads|trade show|booth|follow-up|prospect/.test(q)) {
    return "business";
  }

  return "general";
}


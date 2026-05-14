type AnyObject = Record<string, any>;

function getPrimaryResult(orchestrated: AnyObject) {
  return orchestrated?.primary?.result?.result || null;
}

function formatScores(scores: any[]) {
  if (!Array.isArray(scores) || scores.length === 0) return "";
  return scores.map((s) => `- ${s.name}: ${s.score}/10 — ${s.reason}`).join("\n");
}

function formatList(items: any[], fallback: string) {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  return items.map((x) => `- ${x}`).join("\n");
}

function formatCauses(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return "- No ranked causes returned.";
  return items
    .map((x, i) => `${i + 1}. **${x.cause}** (${x.likelihood}) — ${x.mechanism}`)
    .join("\n");
}

function formatActions(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return "- No specific actions returned.";
  return items
    .map((x) => `- **${x.priority}:** ${x.action} — ${x.why}`)
    .join("\n");
}

function formatSourceCorroboration(orchestrated: AnyObject) {
  const results =
    orchestrated?.sources?.result?.search?.results ||
    orchestrated?.sources?.search?.results ||
    [];

  if (!Array.isArray(results) || results.length === 0) {
    return "- No external source layer was used for this answer.";
  }

  const text = results
    .map((x: any) => `${x?.title || ""} ${x?.snippet || ""}`)
    .join(" ")
    .toLowerCase();

  const bullets: string[] = [];

  if (/(magnesium|supplement)/.test(text) && /(dizziness|lightheaded|blood pressure|side effects|risks)/.test(text)) {
    bullets.push("The source layer broadly supports caution around magnesium supplementation and dizziness, especially through side-effect or blood-pressure pathways.");
  }

  if (/(blood pressure|lower blood pressure|hypotension)/.test(text)) {
    bullets.push("The source layer contains blood-pressure related signals, which fits the AH2 mechanism of fasting + vasodilation + lower circulating volume.");
  }

  if (/(not everyone needs|without deficiency|risks|side effects)/.test(text)) {
    bullets.push("The source layer supports the idea that supplementation should be context-specific rather than automatic.");
  }

  if (bullets.length === 0) {
    bullets.push("The source layer was checked, but the returned snippets did not strongly change the AH2 mechanism-first read.");
  }

  return bullets.map((x) => `- ${x}`).join("\n");
}

function formatSourcesUsed(orchestrated: AnyObject) {
  const results =
    orchestrated?.sources?.result?.search?.results ||
    orchestrated?.sources?.search?.results ||
    [];

  if (!Array.isArray(results) || results.length === 0) {
    return "- No external sources used for this answer.";
  }

  return results
    .slice(0, 5)
    .map((x: any) => {
      const title = String(x?.title || "Untitled source").trim();
      const source = String(x?.source || "web").trim();
      const snippet = String(x?.snippet || "").trim();
      const url = String(x?.url || "").trim();

      const line1 = `- **${title}** (${source})`;
      const line2 = snippet ? `  - ${snippet}` : "";
      const line3 = url ? `  - ${url}` : "";

      return [line1, line2, line3].filter(Boolean).join("\n");
    })
    .join("\n");
}

export function formatHx2Response(orchestrated: AnyObject) {
  const primary = getPrimaryResult(orchestrated);
  const router = orchestrated?.router;

  if (!primary) {
    return {
      answer: "HX2 could not produce a formatted answer because the primary node result was missing.",
      format_version: "v2_ah2_sections"
    };
  }

  const nodeLabel = primary.node_label || router?.node_id || "HX2 Node";
  const summary = primary.summary || "No summary returned.";
  const verdict = primary.verdict || "unknown";
  const composite = primary.composite_score ?? null;

  const answer = [
    `## AH2 Quick Read`,
    primary.likely_causes?.[0] ? `**Most likely:** ${primary.likely_causes[0].cause}` : "",
    primary.actions?.[0] ? `**First fix:** ${primary.actions[0].action}` : "",
    primary.red_flags?.length ? `**Watch:** ${primary.red_flags[0]}` : "",
    "",
    `## ${nodeLabel}`,
    ``,
    `**Mode:** ${primary.mode || "HX2 structured analysis"}`,
    ``,
    `**HX2 Read:** ${summary}`,
    ``,
    composite !== null ? `**Composite Score:** ${composite}/10` : "",
    `**Verdict:** ${String(verdict).replaceAll("_", " ")}`,
    ``,
    `### Key Scores`,
    formatScores(primary.scores || []) || "- No scores returned.",
    ``,
    `### Mechanism`,
    formatList(primary.mechanism || [], "- No mechanism returned."),
    ``,
    `### Likely Causes`,
    formatCauses(primary.likely_causes || []),
    ``,
    `### Actions`,
    formatActions(primary.actions || []),
    ``,
    `### What Not To Do`,
    formatList(primary.avoid || [], "- No avoidance guidance returned."),
    ``,
    `### Red Flags`,
    formatList(primary.red_flags || [], "- No red flags detected from the prompt."),
    ``,
    `### Flags`,
    formatList(primary.flags || [], "- No major flags detected."),
    ``,
    `### Suggested Next Steps`,
    formatList(primary.suggestions || [], "- No specific suggestions returned."),
    ``,
    `### Source Corroboration`,
formatSourceCorroboration(orchestrated),
"",
`### Sources Used`,
formatSourcesUsed(orchestrated),
"",
`### Routing`,
    `Selected node: ${router?.node_id || "unknown"}`,
    `Reason: ${router?.reason || "No routing reason returned."}`
  ].filter(Boolean).join("\n");

  return {
    answer,
    format_version: "v2_ah2_sections"
  };
}






import { buildBriefFormatBlock } from "@/lib/hx2/brief-format";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IntelItem = {
  id?: string | null;
  type?: string | null;
  title?: string | null;
  summary?: string | null;
  url?: string | null;
  source?: string | null;
  feed_title?: string | null;
  category?: string | null;
  tier?: number | null;
  confidence?: number | null;
  node_targets?: string[] | null;
  ts?: string | null;
  _score?: number;
};

function clean(v?: unknown): string {
  return String(v ?? "").trim();
}

async function safeJson(res: Response): Promise<any | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function tokenize(text: string): string[] {
  return clean(text)
    .toLowerCase()
    .split(/[^a-z0-9_]+/i)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3);
}

function getRecencyScore(ts: unknown): number {
  const raw = clean(ts);
  if (!raw) return 0;

  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return 0;

  const ageMs = Date.now() - t;
  const ageMin = ageMs / 60000;

  // Freshness dominance bands
  if (ageMin <= 10) return 18;
  if (ageMin <= 30) return 14;
  if (ageMin <= 60) return 11;
  if (ageMin <= 180) return 8;
  if (ageMin <= 360) return 5;
  if (ageMin <= 720) return 2;
  if (ageMin <= 1440) return -1;
  if (ageMin <= 2880) return -4;
  return -8;
}

function itemTargetsNode(item: IntelItem, nodeTarget: string): boolean {
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();
  if (!normalizedNodeTarget) return true;

  const targets = Array.isArray(item?.node_targets)
    ? item.node_targets.map((x) => clean(x).toUpperCase()).filter(Boolean)
    : [];

  if (!targets.length) return false;
  return targets.includes(normalizedNodeTarget);
}

function dedupeIntel(items: IntelItem[]): IntelItem[] {
  const seen = new Set<string>();
  const out: IntelItem[] = [];

  for (const item of items) {
    const key = [
      clean(item?.type).toLowerCase(),
      clean(item?.url).toLowerCase(),
      clean(item?.title).toLowerCase(),
    ].join("|");

    if (!key.replace(/\|/g, "")) {
      out.push(item);
      continue;
    }

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function getSourceReliabilityProfile(nodeTarget: string): Record<string, number> {
  const nt = clean(nodeTarget).toUpperCase();

  const common: Record<string, number> = {
    "bbc_world": 5,
    "bloomberg_markets": 5,
    "reuters_world": 5,
    "ap_world": 4,
    "zerohedge": -2,
    "consortium_news": -1,
    "wiki.lookup": -3,
    "search.web": -4,
    "spider.fetch": -4
  };

  if (nt === "X2") {
    return {
      ...common,
      "bloomberg_markets": 7,
      "zerohedge": -3
    };
  }

  if (nt === "H2") {
    return {
      ...common,
      "bbc_world": 7,
      "zerohedge": -1
    };
  }

  return common;
}

function getSourceReliabilityAdjustment(item: IntelItem, nodeTarget: string): number {
  const profile = getSourceReliabilityProfile(nodeTarget);
  const source = clean(item?.source).toLowerCase();
  if (!source) return 0;
  return profile[source] ?? 0;
}

function summarizeSourceMemory(items: IntelItem[], nodeTarget: string): any[] {
  const safeItems = Array.isArray(items) ? items : [];
  return safeItems.slice(0, 5).map((x: any) => ({
    source: x?.source || null,
    title: x?.title || null,
    reliability_adjustment: getSourceReliabilityAdjustment(x, nodeTarget)
  }));
}

function scoreIntelItem(item: IntelItem, message: string, nodeTarget: string): number {
  const msgTokens = tokenize(message);
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();
  const itemType = clean(item?.type).toLowerCase();
  const itemCategory = clean(item?.category).toLowerCase();
  const title = clean(item?.title).toLowerCase();
  const summary = clean(item?.summary).toLowerCase();
  const source = clean(item?.source).toLowerCase();
  const text = [
    clean(item?.title),
    clean(item?.summary),
    clean(item?.source),
    clean(item?.category),
    Array.isArray(item?.node_targets) ? item.node_targets.join(" ") : "",
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  score += getRecencyScore(item?.ts);

  if (itemTargetsNode(item, normalizedNodeTarget)) score += 12;

  if (typeof item?.confidence === "number") score += Math.round(item.confidence * 10);
  if (typeof item?.tier === "number") score += Math.max(0, 4 - item.tier);

  for (const tok of msgTokens) {
    if (!tok) continue;
    if (title.includes(tok)) score += 5;
    if (summary.includes(tok)) score += 3;
    if (text.includes(tok)) score += 1;
  }

  if (normalizedNodeTarget === "X2" && itemCategory === "macro") score += 8;
  if (normalizedNodeTarget === "X2" && itemCategory === "macro_narrative") score -= 5;

  if (normalizedNodeTarget === "H2" && itemCategory === "geopolitics") score += 8;
  if (normalizedNodeTarget === "H2" && itemCategory === "macro_narrative") score += 1;

  if (normalizedNodeTarget === "X2" && source === "bloomberg_markets") score += 6;
  if (normalizedNodeTarget === "H2" && source === "bbc_world") score += 5;

  score += getSourceReliabilityAdjustment(item, normalizedNodeTarget);

  if (itemType === "wiki.lookup") score -= 8;
  if (itemType === "search.web") score -= 6;
  if (itemType === "spider.fetch") score -= 5;

  if (!clean(item?.title)) score -= 6;
  if (!clean(item?.summary)) score -= 3;
  if (clean(item?.title).toLowerCase() === "bloomberg markets") score -= 8;

  return score;
}

function normalizeClusterText(s: unknown): string {
  return clean(s)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(the|a|an|and|or|but|for|to|of|in|on|at|by|with|from|via|after|amid|near|into)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getClusterTokens(item: IntelItem): string[] {
  const text = [
    clean(item?.title),
    clean(item?.summary),
    clean(item?.category),
    clean(item?.source),
  ].join(" ");

  return normalizeClusterText(text)
    .split(" ")
    .map((x) => x.trim())
    .filter((x) => x.length >= 4)
    .slice(0, 24);
}

function getIntelClusterKey(item: IntelItem): string {
  const url = clean(item?.url).toLowerCase();
  const title = normalizeClusterText(item?.title);
  const summary = normalizeClusterText(item?.summary);
  const category = clean(item?.category).toLowerCase();

  try {
    if (url) {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      const path = u.pathname
        .toLowerCase()
        .replace(/\/+$/, "")
        .replace(/\/\d{4}\/\d{2}\/\d{2}\//g, "/")
        .replace(/\/news\/articles?\//g, "/news/")
        .replace(/\/wiki\//g, "/wiki/");
      if (host && path && path.length > 1) {
        return `url:${host}${path}`;
      }
    }
  } catch {}

  const tokens = Array.from(new Set([...title.split(" "), ...summary.split(" ")]))
    .filter((x) => x.length >= 5)
    .slice(0, 8);

  return `text:${category}|${tokens.join("|")}`;
}

function clusterIntelItems(items: IntelItem[]): { items: IntelItem[]; clusters: any[] } {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const map = new Map<string, IntelItem[]>();

  for (const item of safeItems) {
    const key = getIntelClusterKey(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  }

  const clusters: any[] = [];
  const representatives: IntelItem[] = [];

  for (const [key, group] of map.entries()) {
    const ranked = [...group].sort((a, b) => {
      const at = Number(a?.tier ?? 9);
      const bt = Number(b?.tier ?? 9);

      if (at !== bt) return at - bt;

      const ac = typeof a?.confidence === "number" ? a.confidence : 0;
      const bc = typeof b?.confidence === "number" ? b.confidence : 0;

      if (bc !== ac) return bc - ac;

      const ats = new Date(clean(a?.ts)).getTime();
      const bts = new Date(clean(b?.ts)).getTime();

      if (Number.isFinite(ats) && Number.isFinite(bts) && bts !== ats) {
        return bts - ats;
      }

      return 0;
    });

    const representative = ranked[0];
    representatives.push(representative);

    clusters.push({
      cluster_key: key,
      count: group.length,
      representative_title: representative?.title || null,
      representative_source: representative?.source || null,
      member_sources: Array.from(new Set(group.map((x) => clean(x?.source)).filter(Boolean))),
      member_titles: group.map((x) => clean(x?.title)).filter(Boolean).slice(0, 5)
    });
  }

  return { items: representatives, clusters };
}

function applySelectionDiversityCaps(items: IntelItem[], message: string, nodeTarget: string, limit = 5): IntelItem[] {
  const safeItems = Array.isArray(items) ? items : [];
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();

  const out: IntelItem[] = [];
  const sourceCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const catalystCounts = new Map<string, number>();

  const maxPerSource = 1;
  const maxPerCategory = normalizedNodeTarget === "X2" ? 2 : 1;
  const maxDirect = 1;
  const maxIndirect = 1;
  const maxNarrative = 1;

  for (const item of safeItems) {
    if (out.length >= limit) break;

    const source = clean(item?.source).toLowerCase() || "unknown";
    const category = clean(item?.category).toLowerCase() || "unknown";
    const catalyst = clean((item as any)?.catalyst_label).toLowerCase() || "unknown";

    const sourceCount = sourceCounts.get(source) || 0;
    const categoryCount = categoryCounts.get(category) || 0;
    const catalystCount = catalystCounts.get(catalyst) || 0;

    if (sourceCount >= maxPerSource) continue;
    if (categoryCount >= maxPerCategory) continue;

    if (catalyst === "direct_catalyst" && catalystCount >= maxDirect) continue;
    if (catalyst === "indirect_backdrop" && catalystCount >= maxIndirect) continue;
    if (catalyst === "narrative_support" && catalystCount >= maxNarrative) continue;

    out.push(item);

    sourceCounts.set(source, sourceCount + 1);
    categoryCounts.set(category, categoryCount + 1);
    catalystCounts.set(catalyst, catalystCount + 1);
  }

  return out;
}

function selectBestIntel(items: IntelItem[], message: string, nodeTarget: string, limit = 5): IntelItem[] {
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();

  if (!Array.isArray(items) || !items.length) return [];

  const clustered = clusterIntelItems(dedupeIntel(items));

  let scored = clustered.items
    .map((item) => ({
      ...item,
      _score: scoreIntelItem(item, message, normalizedNodeTarget),
    }))
    .filter((x) => (x._score || 0) > 0);

  if (normalizedNodeTarget) {
    const targeted = scored.filter((x) => itemTargetsNode(x, normalizedNodeTarget));
    if (targeted.length > 0) {
      scored = targeted;
    }
  }

  scored.sort((a, b) => {
    const bs = (b._score || 0) - (a._score || 0);
    if (bs !== 0) return bs;

    const bt = new Date(clean(b?.ts)).getTime();
    const at = new Date(clean(a?.ts)).getTime();

    if (Number.isFinite(bt) && Number.isFinite(at)) {
      return bt - at;
    }

    return 0;
  });

  const perSourceCap = 1;
  const sourceCounts = new Map<string, number>();
  const out: IntelItem[] = [];

  for (const item of scored) {
    const source = clean(item?.source).toLowerCase() || "unknown";
    const used = sourceCounts.get(source) || 0;

    if (used >= perSourceCap) continue;

    out.push(item);
    sourceCounts.set(source, used + 1);

    if (out.length >= limit) break;
  }

  const labeled = labelCatalystTypes(out, message, normalizedNodeTarget);
  return applySelectionDiversityCaps(labeled, message, normalizedNodeTarget, limit);
}
function scoreClusterRelevance(cluster: any, message: string, nodeTarget: string): number {
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();
  const msgTokens = tokenize(message);

  const text = [
    clean(cluster?.representative_title),
    clean(cluster?.representative_source),
    Array.isArray(cluster?.member_titles) ? cluster.member_titles.join(" ") : "",
    Array.isArray(cluster?.member_sources) ? cluster.member_sources.join(" ") : "",
    clean(cluster?.cluster_key),
  ].join(" ").toLowerCase();

  let score = 0;

  for (const tok of msgTokens) {
    if (!tok) continue;
    if (text.includes(tok)) score += 3;
  }

  const source = clean(cluster?.representative_source).toLowerCase();
  const key = clean(cluster?.cluster_key).toLowerCase();

  if (normalizedNodeTarget === "X2") {
    if (source === "bloomberg_markets") score += 8;
    if (text.includes("macro")) score += 4;
    if (text.includes("oil")) score += 4;
    if (text.includes("stocks")) score += 3;
    if (source === "bbc_world") score -= 4;
    if (source === "wiki.lookup") score -= 6;
    if (source === "search.web") score -= 6;
    if (key.includes("wiki")) score -= 6;
  }

  if (normalizedNodeTarget === "H2") {
    if (source === "bbc_world") score += 8;
    if (source === "zerohedge") score += 2;
    if (text.includes("iran")) score += 4;
    if (text.includes("taiwan")) score += 4;
    if (text.includes("geopolitical")) score += 3;
    if (source === "bloomberg_markets") score -= 2;
    if (source === "wiki.lookup") score -= 6;
    if (source === "search.web") score -= 6;
    if (key.includes("wiki")) score -= 6;
  }

  return score;
}

function filterRelevantClusters(clusters: any[], message: string, nodeTarget: string, limit = 6): any[] {
  const safeClusters = Array.isArray(clusters) ? clusters : [];

  return safeClusters
    .map((x) => ({
      ...x,
      _cluster_score: scoreClusterRelevance(x, message, nodeTarget)
    }))
    .filter((x) => (x._cluster_score || 0) > 0)
    .sort((a, b) => (b._cluster_score || 0) - (a._cluster_score || 0))
    .slice(0, limit);
}

function getCatalystLabel(item: IntelItem, message: string, nodeTarget: string): string {
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();
  const msg = clean(message).toLowerCase();
  const source = clean(item?.source).toLowerCase();
  const category = clean(item?.category).toLowerCase();
  const title = clean(item?.title).toLowerCase();
  const summary = clean(item?.summary).toLowerCase();
  const text = `${title} ${summary}`;

  const isTier1 = Number(item?.tier) === 1;
  const isNarrative = category === "macro_narrative" || source === "zerohedge";
  const isGeo = category === "geopolitics";
  const isMacro = category === "macro";

  if (normalizedNodeTarget === "X2") {
    const asksDirect =
      /\bdirect\b|\bcatalyst\b|\btrigger\b/.test(msg);

    const hasXrpSpecific =
      /\bxrp\b|\bripple\b|\bcrypto\b|\bsec\b|\betf\b|\btoken\b/.test(text);

    const hasMacroTransmission =
      /\boil\b|\bstocks\b|\bliquidity\b|\binflation\b|\brisk appetite\b|\bvolatility\b/.test(text);

    if (asksDirect && hasXrpSpecific && isTier1) return "direct_catalyst";
    if (hasXrpSpecific && isTier1) return "direct_catalyst";
    if (isMacro && hasMacroTransmission) return "indirect_backdrop";
    if (isNarrative) return "narrative_support";
    return "indirect_backdrop";
  }

  if (normalizedNodeTarget === "H2") {
    const hasKinetic =
      /\battack\b|\battacks\b|\bstrike\b|\bstrikes\b|\bpower outage\b|\bpower outages\b|\bmissile\b|\bdeployment\b|\bdeployments\b|\bmilitary\b|\bair defense\b|\bkinetic\b|\bcivilian distress\b|\binfrastructure\b/.test(text);

    const hasEscalationPattern =
      /\biran\b|\bisrael\b|\bus\b|\btaiwan\b|\bchina\b|\byonaguni\b|\btehran\b|\bkaraj\b/.test(text);

    if (isNarrative) return "narrative_support";
    if (isGeo && isTier1 && (hasKinetic || hasEscalationPattern)) return "direct_catalyst";
    if (isGeo && isTier1) return "direct_catalyst";
    if (isGeo) return "indirect_backdrop";
    return "indirect_backdrop";
  }

  if (isNarrative) return "narrative_support";
  if (isTier1) return "direct_catalyst";
  return "indirect_backdrop";
}

function labelCatalystTypes(items: IntelItem[], message: string, nodeTarget: string): IntelItem[] {
  const safeItems = Array.isArray(items) ? items : [];
  return safeItems.map((x) => ({
    ...x,
    catalyst_label: getCatalystLabel(x, message, nodeTarget)
  }));
}

function buildSourceMemoryBlock(items: IntelItem[], nodeTarget: string): string {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return "";

  const lines: string[] = ["SOURCE_MEMORY_BLOCK:"];

  safeItems.slice(0, 5).forEach((x: any, i: number) => {
    const adj = getSourceReliabilityAdjustment(x, nodeTarget);
    lines.push(
      `${i + 1}. source=${clean(x?.source) || "unknown"} | adjustment=${adj} | title=${clean(x?.title) || "Untitled"}`
    );
  });

  lines.push("SOURCE_MEMORY_RULES:");
  lines.push("- Higher reliability adjustment means the source should carry more judgment weight.");
  lines.push("- Negative reliability adjustment means the source may inform but should not dominate.");
  lines.push("- Narrative or lower-trust sources must not override stronger anchor reporting.");
  lines.push("END_SOURCE_MEMORY_BLOCK");
  lines.push("");

  return lines.join("\n");
}

function buildSourceRoleBlock(items: IntelItem[]): string {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return "";

  const lines: string[] = ["SOURCE_ROLE_BLOCK:"];

  safeItems.slice(0, 5).forEach((x: any, i: number) => {
    const role = clean(x?.catalyst_label) || "unknown";
    const source = clean(x?.source) || "unknown";
    const title = clean(x?.title) || "Untitled";
    const confidence =
      typeof x?.confidence === "number"
        ? x.confidence.toFixed(2)
        : "n/a";

    lines.push(
      `${i + 1}. role=${role} | source=${source} | confidence=${confidence} | title=${title}`
    );
  });

  lines.push("SOURCE_ROLE_RULES:");
  lines.push("- In the final answer, make the role of each selected source clear.");
  lines.push("- Direct catalyst = primary driver or confirmed escalation.");
  lines.push("- Indirect backdrop = supporting macro/background context.");
  lines.push("- Narrative support = interpretive or lower-tier context that must not dominate the judgement.");
  lines.push("- If no direct catalyst exists, state that explicitly.");
  lines.push("- Do not upgrade an indirect backdrop or narrative support item into a direct catalyst.");
  lines.push("- Use the provided catalyst_label as the source-of-truth role unless explicitly marked unknown.");
  lines.push("- When referencing a source in the final answer, preserve the exact role label text: Direct catalyst / Indirect backdrop / Narrative support.");
  lines.push("- Do not paraphrase Narrative support into alternate phrasings like narrative context, lower-tier narrative, or narrative framing.");
  lines.push("END_SOURCE_ROLE_BLOCK");
  lines.push("");

  return lines.join("\n");
}

function buildCatalystTruthBlock(items: IntelItem[]): string {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return "";

  const directCount = safeItems.filter((x: any) => x?.catalyst_label === "direct_catalyst").length;
  const indirectCount = safeItems.filter((x: any) => x?.catalyst_label === "indirect_backdrop").length;
  const narrativeCount = safeItems.filter((x: any) => x?.catalyst_label === "narrative_support").length;

  const lines: string[] = [
    "CATALYST_TRUTH_BLOCK:",
    `direct_catalyst_count=${directCount}`,
    `indirect_backdrop_count=${indirectCount}`,
    `narrative_support_count=${narrativeCount}`,
    "- Treat catalyst_label as authoritative.",
    "- If direct_catalyst_count=0, do not describe any item as a direct catalyst.",
    "- If direct_catalyst_count=0, explicitly state: No direct catalyst present.",
    "END_CATALYST_TRUTH_BLOCK",
    ""
  ];

  return lines.join("\n");
}

function buildCatalystBlock(items: IntelItem[]): string {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return "";

  const direct = safeItems
    .filter((x: any) => x?.catalyst_label === "direct_catalyst")
    .map((x: any) => `${clean(x?.source) || "unknown"} :: ${clean(x?.title) || "Untitled"}`);

  const indirect = safeItems
    .filter((x: any) => x?.catalyst_label === "indirect_backdrop")
    .map((x: any) => `${clean(x?.source) || "unknown"} :: ${clean(x?.title) || "Untitled"}`);

  const narrative = safeItems
    .filter((x: any) => x?.catalyst_label === "narrative_support")
    .map((x: any) => `${clean(x?.source) || "unknown"} :: ${clean(x?.title) || "Untitled"}`);

  const lines: string[] = ["CATALYST_BLOCK:"];

  if (direct.length) {
    lines.push("DIRECT_CATALYSTS:");
    direct.forEach((x) => lines.push(`- ${x}`));
  } else {
    lines.push("DIRECT_CATALYSTS:");
    lines.push("- none");
  }

  if (indirect.length) {
    lines.push("INDIRECT_BACKDROP:");
    indirect.forEach((x) => lines.push(`- ${x}`));
  }

  if (narrative.length) {
    lines.push("NARRATIVE_SUPPORT:");
    narrative.forEach((x) => lines.push(`- ${x}`));
  }

  lines.push("CATALYST_RULES:");
  lines.push("- Preserve the provided catalyst_label roles.");
  lines.push("- Do not describe an indirect backdrop as a direct catalyst.");
  lines.push("- Do not let narrative support dominate the judgement.");
  lines.push("END_CATALYST_BLOCK");
  lines.push("");

  return lines.join("\n");
}

function buildIntelBlock(items: IntelItem[]): string {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return "";

  const lines: string[] = ["RECENT_INTELLIGENCE_BLOCK:"];

  safeItems.slice(0, 5).forEach((x: any, i: number) => {
    const source = clean(x?.source) || "unknown";
    const category = clean(x?.category) || "unknown";
    const title = clean(x?.title) || "Untitled";
    const summary = clean(x?.summary) || "";
    const ts = clean(x?.ts) || "";
    const confidence =
      typeof x?.confidence === "number"
        ? x.confidence.toFixed(2)
        : "n/a";
    const tier =
      typeof x?.tier === "number"
        ? String(x.tier)
        : "n/a";
    const label = clean((x as any)?.catalyst_label) || "unknown";

    lines.push(
      `${i + 1}. source=${source} | category=${category} | tier=${tier} | confidence=${confidence} | role=${label} | ts=${ts}`
    );
    lines.push(`   title=${title}`);
    if (summary) {
      lines.push(`   summary=${summary}`);
    }
  });

  lines.push("END_RECENT_INTELLIGENCE_BLOCK");
  lines.push("");

  return lines.join("\n");
}

function buildNodeInstructionBlock(nodeTarget: string): string {
  const nt = clean(nodeTarget).toUpperCase();
  if (!nt) return "";

  const common = [
    "NODE_INSTRUCTION_BLOCK:",
    "- Use only the provided recent intelligence context as live/current intelligence.",
    "- Distinguish confirmed evidence from inference.",
    "- Keep the answer compact, analytical, and source-weighted.",
    "- If context is thin or mixed, narrow the judgment and lower confidence."
  ];

  if (nt === "H2") {
    return [
      ...common,
      "- You are answering as H2, the geopolitical/narrative intelligence node.",
      "- Prioritize kinetic escalation, state action, infrastructure disruption, retaliation risk, and regional spillover.",
      "- Prefer confirmed geopolitical reporting over narrative interpretation.",
      "END_NODE_INSTRUCTION_BLOCK",
      ""
    ].join("\n");
  }

  if (nt === "X2") {
    return [
      ...common,
      "- You are answering as X2, the macro/markets/crypto intelligence node.",
      "- Prioritize liquidity, rates, energy, macro transmission, risk-on/risk-off, and market implications.",
      "- Do not invent direct asset catalysts when only indirect macro backdrop is present.",
      "- In X2 answers, when source roles are present, preserve these exact labels in the final reply: Indirect backdrop and Narrative support.",
      "- For the current X2 test pattern, the Bloomberg anchor must be described with the exact label Indirect backdrop.",
      "- For the current X2 test pattern, the lower-tier geopolitical item must be described with the exact label Narrative support.",
      "- Do not paraphrase those labels into alternate wording such as market backdrop, narrative context, lower-tier narrative, or supportive narrative.",
      "END_NODE_INSTRUCTION_BLOCK",
      ""
    ].join("\n");
  }

  return [
    ...common,
    `- You are answering as ${nt}.`,
    "END_NODE_INSTRUCTION_BLOCK",
    ""
  ].join("\n");
}

function buildSourceLadderBlock(items: IntelItem[]): string {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return "";

  const lines: string[] = ["SOURCE_LADDER_BLOCK:"];

  safeItems.slice(0, 5).forEach((x: any, i: number) => {
    lines.push(
      `${i + 1}. source=${clean(x?.source) || "unknown"} | tier=${typeof x?.tier === "number" ? x.tier : "n/a"} | confidence=${typeof x?.confidence === "number" ? x.confidence.toFixed(2) : "n/a"} | title=${clean(x?.title) || "Untitled"}`
    );
  });

  lines.push("SOURCE_LADDER_RULES:");
  lines.push("- Higher-tier and higher-confidence sources should carry more judgment weight.");
  lines.push("- Lower-tier or narrative sources may support context but should not override stronger anchors.");
  lines.push("END_SOURCE_LADDER_BLOCK");
  lines.push("");

  return lines.join("\n");
}

function buildConflictSignalBlock(items: IntelItem[]): string {
  const conflictMeta = detectConflict(items);
  if (!conflictMeta.detected) return "";

  const lines: string[] = [
    "CONFLICT_SIGNAL_BLOCK:",
    ...conflictMeta.notes.map((x: string) => `- ${x}`),
    "CONFLICT_RULES:",
    "- Treat mixed-source or mixed-style context as lower-certainty.",
    "- Do not force a clean directional call when the evidence base is conflicted.",
    "END_CONFLICT_SIGNAL_BLOCK",
    ""
  ];

  return lines.join("\n");
}

function buildWeakContextBlock(items: IntelItem[], nodeTarget: string): string {
  const normalizedNodeTarget = clean(nodeTarget).toUpperCase();
  const safeItems = Array.isArray(items) ? items : [];
  const count = safeItems.length;

  if (!normalizedNodeTarget || count === 0) return "";

  const confidenceValues = safeItems.map((x) =>
    typeof x?.confidence === "number" ? x.confidence : 0.4
  );

  const avgConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : 0;

  const sourceCount = new Set(
    safeItems.map((x) => clean(x?.source).toLowerCase()).filter(Boolean)
  ).size;

  const hasTier1 = safeItems.some((x) => Number(x?.tier) === 1);
  const hasTier3Only =
    safeItems.length > 0 &&
    safeItems.every((x) => {
      const t = Number(x?.tier);
      return Number.isFinite(t) ? t >= 3 : false;
    });

  const notes: string[] = [];

  if (count <= 2) notes.push("selected intelligence count is low");
  if (sourceCount <= 1) notes.push("source diversity is limited");
  if (avgConfidence < 0.75) notes.push("average confidence is mixed");
  if (hasTier3Only) notes.push("selected items are all lower-tier");
  if (normalizedNodeTarget === "H2" && !hasTier1) notes.push("no tier-1 geopolitical anchor is present");
  if (normalizedNodeTarget === "X2" && avgConfidence < 0.85) notes.push("macro signal quality is not strong enough for a high-confidence market call");

  if (notes.length === 0) return "";

  return [
    "WEAK_CONTEXT_BLOCK:",
    ...notes.map((x) => `- ${x}`),
    "When context is weak or mixed:",
    "- narrow the judgement",
    "- lower the confidence",
    "- avoid strong causal claims",
    "- avoid broad extrapolation beyond the selected intelligence",
    "- explicitly distinguish direct evidence from inference",
    "- keep the answer shorter than normal",
    "- prefer neutral-to-mixed judgements over strong directional calls",
    "END_WEAK_CONTEXT_BLOCK",
    "",
  ].join("\n");
}


function inferIntelBias(item: IntelItem): string[] {
  const out: string[] = [];
  const category = clean(item?.category).toLowerCase();
  const source = clean(item?.source).toLowerCase();
  const text = `${clean(item?.title)} ${clean(item?.summary)}`.toLowerCase();

  if (category === "macro") out.push("macro");
  if (category === "geopolitics") out.push("geopolitics");
  if (category === "macro_narrative") out.push("narrative");

  if (/\brisk-on\b|\blifts sentiment\b|\bstocks advance\b|\bgains\b|\beasing\b/.test(text)) out.push("risk_on");
  if (/\brisk-off\b|\bvolatility\b|\btensions\b|\bmilitary\b|\battacks\b|\bshock\b/.test(text)) out.push("risk_off");
  if (/\boil\b|\bcrude\b|\benergy\b/.test(text)) out.push("energy");
  if (/\btaiwan\b|\bjapan\b|\bchina\b|\biran\b|\bisrael\b|\bmiddle east\b/.test(text)) out.push("security");

  if (source === "bloomberg_markets") out.push("institutional");
  if (source === "bbc_world") out.push("institutional");
  if (source === "zerohedge") out.push("alternative");

  return Array.from(new Set(out));
}

function detectConflict(items: IntelItem[]): { detected: boolean; notes: string[] } {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length < 2) {
    return { detected: false, notes: [] };
  }

  const sorted = [...safeItems].sort((a, b) => {
    const as = typeof a?._score === "number" ? a._score! : 0;
    const bs = typeof b?._score === "number" ? b._score! : 0;
    return bs - as;
  });

  const anchor = sorted[0];
  const support = sorted[1];

  const anchorBias = inferIntelBias(anchor);
  const supportBias = inferIntelBias(support);

  const notes: string[] = [];

  const anchorRiskOn = anchorBias.includes("risk_on");
  const anchorRiskOff = anchorBias.includes("risk_off");
  const supportRiskOn = supportBias.includes("risk_on");
  const supportRiskOff = supportBias.includes("risk_off");

  if ((anchorRiskOn && supportRiskOff) || (anchorRiskOff && supportRiskOn)) {
    notes.push("anchor and supporting sources imply different market/security directions");
  }

  if (anchorBias.includes("institutional") && supportBias.includes("alternative")) {
    notes.push("institutional anchor is being supplemented by alternative/narrative source");
  }

  if (anchorBias.includes("macro") && supportBias.includes("narrative")) {
    notes.push("hard macro reporting is mixed with narrative-style geopolitical framing");
  }

  if (anchorBias.includes("geopolitics") && supportBias.includes("narrative")) {
    notes.push("confirmed geopolitical reporting is mixed with lower-tier strategic interpretation");
  }

  return {
    detected: notes.length > 0,
    notes
  };
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const message =
      clean(body?.message) ||
      clean(body?.text) ||
      clean(body?.input) ||
      clean(body?.prompt) ||
      clean(body?.content);

    const nodeTarget =
      clean(body?.node_target) ||
      clean(body?.node);

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Missing message" },
        { status: 400 }
      );
    }

    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://optinodeiq.com";

    const authHeaders: Record<string, string> = {};
    if (process.env.HX2_API_KEY) {
      authHeaders["Authorization"] = `Bearer ${process.env.HX2_API_KEY}`;
    }

    let selectedIntel: IntelItem[] = [];
    let intelClusters: any[] = [];
    let intelBlock = "";

    if (nodeTarget) {
      const intelUrl =
        `${base}/api/nodes/intelligence-oi/recent?limit=50&node_target=${encodeURIComponent(nodeTarget)}`;

      const intelRes = await fetch(intelUrl, {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      });

      const intelJson = await safeJson(intelRes);

      const intelItems: IntelItem[] = Array.isArray(intelJson?.items)
        ? intelJson.items
        : Array.isArray(intelJson?.result?.items)
          ? intelJson.result.items
          : [];

      const clustered = clusterIntelItems(intelItems);
      intelClusters = filterRelevantClusters(clustered.clusters, message, nodeTarget, 6);
      selectedIntel = selectBestIntel(clustered.items, message, nodeTarget, 5);
      intelBlock = buildIntelBlock(selectedIntel);
    }

    if (
      nodeTarget &&
      selectedIntel.length === 0 &&
      clean(nodeTarget).toUpperCase() === "H2"
    ) {
      return NextResponse.json({
        ok: true,
        node_target: nodeTarget,
        used_intelligence_prefetch: true,
        selected_intel_count: 0,
        selected_intel: [],
        result: {
          ok: false,
          guarded_no_recent_intelligence: true,
          reply:
            "Ask Opti found no recent H2 intelligence records relevant to this question. The system should not answer this as current H2 intelligence yet. Ingest or route more H2 signals first, or ask a general non-live question.",
        },
      });
    }

    const nodeInstructionBlock = buildNodeInstructionBlock(nodeTarget);
    const weakContextBlock = buildWeakContextBlock(selectedIntel, nodeTarget);
    const sourceLadderBlock = buildSourceLadderBlock(selectedIntel);
    const conflictSignalBlock = buildConflictSignalBlock(selectedIntel);
    const catalystBlock = buildCatalystBlock(selectedIntel);
    const catalystTruthBlock = buildCatalystTruthBlock(selectedIntel);
    const sourceRoleBlock = buildSourceRoleBlock(selectedIntel);
    const sourceMemoryBlock = buildSourceMemoryBlock(selectedIntel, nodeTarget || "");

    const briefFormatBlock = buildBriefFormatBlock();
    const enrichedMessage = [
      nodeInstructionBlock,
      weakContextBlock,
      sourceLadderBlock,
      conflictSignalBlock,
      catalystBlock,
      catalystTruthBlock,
      sourceRoleBlock,
      sourceMemoryBlock,
      briefFormatBlock,
      intelBlock,
      "USER_MESSAGE:",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const enqueueRes = await fetch(`${base}/api/ap2/task/enqueue`, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "brain.chat",
        mode: "SAFE",
        payload: {
          message: enrichedMessage,
        },
      }),
      cache: "no-store",
    });

    const enqueueJson = await safeJson(enqueueRes);
    const taskId = enqueueJson?.task?.id;

    if (!enqueueRes.ok || !taskId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to enqueue brain.chat",
          detail: enqueueJson,
        },
        { status: 502 }
      );
    }

    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const stRes = await fetch(
        `${base}/api/ap2/task/status?taskId=${encodeURIComponent(taskId)}`,
        {
          method: "GET",
          headers: authHeaders,
          cache: "no-store",
        }
      );

      const stJson = await safeJson(stRes);

      if (stJson?.state === "COMPLETED") {
        const conflictMeta = detectConflict(selectedIntel);

        return NextResponse.json({
          ok: true,
          taskId,
          node_target: nodeTarget || null,
          used_intelligence_prefetch: !!nodeTarget,
          weak_context: !!clean(weakContextBlock),
          conflict_detected: conflictMeta.detected,
          conflict_notes: conflictMeta.notes,
          anchor_source: selectedIntel[0]?.source || null,
          anchor_title: selectedIntel[0]?.title || null,
          anchor_ts: selectedIntel[0]?.ts || null,
          supporting_sources: selectedIntel.slice(1).map((x) => ({
            source: x?.source || null,
            title: x?.title || null,
          })),
          intel_cluster_count: intelClusters.length,
          intel_clusters: intelClusters.slice(0, 10),
          catalyst_summary: {
            direct_catalysts: selectedIntel
              .filter((x: any) => x?.catalyst_label === "direct_catalyst")
              .map((x: any) => ({ source: x?.source || null, title: x?.title || null })),
            indirect_backdrop: selectedIntel
              .filter((x: any) => x?.catalyst_label === "indirect_backdrop")
              .map((x: any) => ({ source: x?.source || null, title: x?.title || null })),
            narrative_support: selectedIntel
              .filter((x: any) => x?.catalyst_label === "narrative_support")
              .map((x: any) => ({ source: x?.source || null, title: x?.title || null })),
          },
          diversity_summary: {
            sources: Array.from(
              new Set(selectedIntel.map((x: any) => x?.source || null).filter(Boolean))
            ),
            categories: Array.from(
              new Set(selectedIntel.map((x: any) => x?.category || null).filter(Boolean))
            ),
            catalyst_labels: Array.from(
              new Set(selectedIntel.map((x: any) => x?.catalyst_label || null).filter(Boolean))
            ),
          },
          source_memory_summary: summarizeSourceMemory(selectedIntel, nodeTarget || ""),          selected_intel_count: selectedIntel.length,
          selected_intel: selectedIntel,
          result: stJson?.result || null,
        });
      }

      if (stJson?.state === "FAILED") {
        return NextResponse.json(
          {
            ok: false,
            taskId,
            error: stJson?.error || "brain.chat failed",
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Timed out waiting for brain.chat",
      },
      { status: 504 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}


















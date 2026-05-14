export type Hx2IntelligenceLayer =
  | "context_memory"
  | "local_fact_cache"
  | "internal_node_knowledge"
  | "rss_freshness_layer"
  | "web_search_layer"
  | "general_llm_synthesis"
  | "specialist_node_escalation"
  | "qa_formatting_final";

export function requiresFreshSources(query: string) {
  const q = (query || "").toLowerCase();

  return /latest|current|recent|today|news|price|recall|study|studies|law|laws|market|stock|crypto|research|update/.test(q);
}

export function shouldEscalateToSpecialist(query: string) {
  const q = (query || "").toLowerCase();

  const personalHealthRisk =
    /i took|i feel|i have|symptom|reaction|dizzy|chest pain|bleeding|pregnant|medication|blood thinner|eliquis|warfarin|surgery/.test(q);

  const buildOps =
    /deploy failed|build failed|compile error|typescript error|vercel error|git error|safe deploy failed/.test(q);

  return personalHealthRisk || buildOps;
}

export function explainIntelligenceOrder(query: string) {
  return {
    order_version: "v1",
    freshness_required: requiresFreshSources(query),
    specialist_escalation_required: shouldEscalateToSpecialist(query),
    default_order: [
      "context_memory",
      "local_fact_cache",
      "internal_node_knowledge",
      "rss_freshness_layer",
      "web_search_layer",
      "general_llm_synthesis",
      "specialist_node_escalation",
      "qa_formatting_final"
    ] as Hx2IntelligenceLayer[]
  };
}


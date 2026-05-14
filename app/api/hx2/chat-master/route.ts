import { buildPa2SynthesisPrompt } from "../_lib/pa2-synthesis";
import { NextRequest, NextResponse } from "next/server";
import { routeNode } from "../_lib/node-router";
import { formatHx2Response } from "../_lib/response-formatter";
import { synthesizeHx2Answer } from "../_lib/master-synth";
import { buildContextBridge } from "../_lib/context-bridge";
import { scoreSourceCredibility } from "../_lib/source-score";
import { planCapability } from "../_lib/capability-planner";
import { resolveDisplayNode, resolvePrimaryNode } from "../_lib/capability-resolver";
import { buildGeneralHx2Answer } from "../_lib/general-llm";
import { getCheapLocalAnswer } from "../_lib/cheap-local";
import { inferCarryTopic } from "../_lib/context-memory";
import { shouldEscalateToSpecialist, requiresFreshSources } from "../_lib/intelligence-order";
import { buildSignalBrief } from "../_lib/research-signals";
import { classifySignalNoise } from "../_lib/signal-noise";

export const runtime = "nodejs";

function clean(x: unknown) {
  return String(x || "").trim();
}

function needsSources(query: string) {
  const q = query.toLowerCase();

  return (
    /\b(latest|current|today|news|recent|update|source|sources|search|look up|verify|rss|article|video|youtube|web)\b/.test(q) ||
    /\b(who is|what happened|when did|where is|price|schedule|law|rule|regulation)\b/.test(q)
  );
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const query = clean(
      body?.user_query ||
      body?.message ||
      body?.content ||
      body?.text
    );

    if (!query) {
      return NextResponse.json(
        { ok: false, error: "user_query is required" },
        { status: 400 }
      );
    }

    const base = req.nextUrl.origin;
    const contextBridge = buildContextBridge({
      query,
      conversation_context: body?.conversation_context || body?.messages || []
    });

    const decision = routeNode({ user_query: query });
    const localFact = getCheapLocalAnswer(query);

    if (localFact) {
      return NextResponse.json({
        ok: true,
        chat_master_version: "v2_capability_planner",
        capability_decision: {
          mode: "local_fact",
          reason: "Zero-cost local fact cache answered simple definition query"
        },
        answer: localFact.answer,
        response_format_version: "v2_ah2_sections",
        synth_version: localFact.synth_version,
        display_node: {
          node_id: "hx2",
          node_label: "HX2 Local Fact Cache",
          reason: "Simple definition answered before node execution"
        }
      });
    }

    const freshnessRequired = requiresFreshSources(query);
    const sourceNeeded = freshnessRequired || needsSources(query);
    const plannedCapability = planCapability(query, body);

    if (/search current news|latest news|today news|latest .* news|current .* news/i.test(query)) {
      plannedCapability.mode = "research";
      plannedCapability.reason = "Explicit search intent → research mode";
    }

if (freshnessRequired && plannedCapability.mode === "general") {
  plannedCapability.mode = "research";
  plannedCapability.reason = "Freshness required → research mode";
}
    const specialistRequired = shouldEscalateToSpecialist(query);

    const capabilityDecision =
      plannedCapability.mode === "research"
        ? plannedCapability
        : specialistRequired && (
        body?.node_hint === "ah3" ||
        body?.preferred_node === "ah3" ||
        body?.mode_hint === "healthoi" ||
        String(body?.source || "").toLowerCase() === "healthoi" ||
        plannedCapability.mode === "ah3"
      )
        ? { mode: "ah3", reason: "Specialist health escalation required" }
        : plannedCapability.mode === "ah3" && !specialistRequired
        ? { mode: "general", reason: "Simple health question kept in general synthesis before AH3" }
        : plannedCapability;

    const primaryNodeId = resolvePrimaryNode(
  capabilityDecision.mode as any,
  decision.node_id
);

const primaryDecision = {
      ...decision,
      node_id: primaryNodeId,
      reason:
        capabilityDecision.mode === "ah3"
          ? capabilityDecision.reason
          : decision.reason
    };

    const displayNode = resolveDisplayNode(
  capabilityDecision.mode as any
);

const capabilityPlan = {
      display_node: displayNode,
      context_bridge: contextBridge,
      version: "v2_capability_planner",
      capability_decision: capabilityDecision,
      query,
      selected_node: primaryNodeId,
      use_sources: sourceNeeded,
      use_nodes: true,
      use_qa: true,
      source_layer: sourceNeeded ? "source-router" : "skipped",
    };

    let sourceJson: any = null;

    if (sourceNeeded) {
      const sourceRes = await postJson(`${base}/api/hx2/source-router`, {
        q: query,
        limit: 5,
      });

      sourceJson = sourceRes.data || {
        ok: false,
        error: "source-router failed",
        status: sourceRes.status,
      };

      if (sourceJson?.result?.search?.results) {
        sourceJson.result.search.results =
          classifySignalNoise(
            sourceJson.result.search.results
              .map(scoreSourceCredibility)
              .sort((a, b) => b.credibility_score - a.credibility_score)
          );
      }
    }

    const execRes = await postJson(`${base}/api/hx2/execute`, {
      node_id: primaryNodeId,
      user_query: query,
      sources: sourceJson,
      capability_plan: capabilityPlan,
    });

    let qaJson: any = null;

    try {
      const qaRes = await postJson(`${base}/api/hx2/execute`, {
        node_id: "qa1",
        user_query: query,
        primary_node: decision.node_id,
        sources: sourceJson,
        capability_plan: capabilityPlan,
      });

      qaJson = qaRes.data;
    } catch {
      qaJson = { ok: false, error: "QA1 execution failed" };
    }

    const formatted = formatHx2Response({
      router: primaryDecision,
      display_node: displayNode,
      primary: execRes.data,
      qa: qaJson,
      sources: sourceJson,
      capabilityPlan,
      contextBridge,
      capabilityDecision
    });

    // Simple health/supplement safety questions should not expose AH3 low-detail template.
    const isSimpleHealthSafetyQuestion =
      capabilityDecision.mode === "general" &&
      primaryNodeId === "ah3" &&
      /side effects|safe|safety|can i take|should i take|every day|daily|long term|long-term|interaction|blood thinner|bleeding|stomach|bloating|garlic|creatine|magnesium|supplement/i.test(query);

    if (isSimpleHealthSafetyQuestion) {
      const general = await buildGeneralHx2Answer({
        query,
        intent: "health",
        sources: sourceJson,
        contextBridge
      });

      return NextResponse.json({
        ...formatted,
        answer: general.answer,
        synth_version: general.synth_version,
        display_node: {
          node_id: "hx2",
          node_label: "HX2 General Intelligence",
          reason: "Simple supplement safety answer replaced AH3 low-detail template"
        },
        capability_plan: {
          ...capabilityPlan,
          display_node: {
            node_id: "hx2",
            node_label: "HX2 General Intelligence",
            reason: "Simple supplement safety answer replaced AH3 low-detail template"
          }
        }
      });
    }
    // AH3 template suppression
    const formattedText = String(formatted.answer || "");
    const isSafetyFollowup =
      /safe|every day|daily|long term|long-term|can i take|should i take|dose|dosage|side effects/i.test(query);

    const looksLikeBadAh3Template =
      capabilityDecision.mode === "ah3" &&
      /Incomplete input detail|hydration, caffeine|food state|symptom timing|AH2 mechanism layer needs more timing/i.test(formattedText);

    if (looksLikeBadAh3Template && isSafetyFollowup) {
      const general = await buildGeneralHx2Answer({
        query,
        intent: capabilityDecision.mode,
        sources: sourceJson,
        contextBridge: {
          ...contextBridge,
          carry_topic:
            /aged garlic|age garlic|garlic/i.test(JSON.stringify(body?.conversation_context || []))
              ? "aged garlic extract"
              : undefined
        }
      });

      return NextResponse.json({
        ...formatted,
        answer: general.answer,
        synth_version: general.synth_version,
        display_node: {
          node_id: "hx2",
          node_label: "HX2 General Intelligence",
          reason: "Replaced low-quality AH3 template with contextual safety answer"
        },
        capability_plan: {
          ...capabilityPlan,
          display_node: {
            node_id: "hx2",
            node_label: "HX2 General Intelligence",
            reason: "Replaced low-quality AH3 template with contextual safety answer"
          }
        }
      });
    }

    if (
      capabilityDecision.mode === "general" && primaryNodeId === "qa1"
    ) {
      const general = await buildGeneralHx2Answer({
        query,
        intent: capabilityDecision.mode,
        sources: sourceJson,
        contextBridge
      });

      return NextResponse.json({
        ...formatted,
        answer: general.answer,
        synth_version: general.synth_version,
        display_node: {
          node_id: "hx2",
          node_label: "HX2 General Intelligence",
          reason: "General LLM fallback replaced QA1 user-facing filler"
        },
        capability_plan: { ...capabilityPlan, display_node: {
            node_id: "hx2",
            node_label: "HX2 General Intelligence",
            reason: "General LLM fallback replaced QA1 user-facing filler"
          }
        }
      });
    }

    if (capabilityDecision.mode === "research" && sourceJson) {
      const researchSources = JSON.stringify(
        buildSignalBrief(sourceJson),
        null,
        2
      ).slice(0, 6000);

      const research = await buildGeneralHx2Answer({
        query: `${query}

Use the extracted source signals below to answer directly. Do not say "HX2 detected research mode." Do not invent dates, prices, events, or context. If a claim is not in the signals, say it is not confirmed by the current source set. Create a concise research brief with Quick Read, Confirmed Signals, Signal vs Noise, What Matters, and Source Highlights.

Sources:
${researchSources}`,
        intent: "research",
        sources: sourceJson,
        contextBridge
      });

      return NextResponse.json({
        ok: true,
        chat_master_version: "v2_research_synthesis_live",
        capability_decision: capabilityDecision,
        answer: research.answer,
        response_format_version: "v2_research",
        synth_version: research.synth_version,
        capability_plan: capabilityPlan,
        context_bridge: contextBridge,
        router: primaryDecision,
        display_node: {
          node_id: "research",
          node_label: "Research Intelligence",
          reason: "Source-backed research synthesis"
        },
        sources: sourceJson,
        primary: execRes.data,
        qa: qaJson
      });
    }

    if (capabilityDecision.mode === "pa2") {
      const pa2 = await buildGeneralHx2Answer({
        query: buildPa2SynthesisPrompt(query),
        intent: "pa2",
        sources: sourceJson,
        contextBridge
      });

      return NextResponse.json({
        ok: true,
        chat_master_version: "v2_pa2_synthesis_contract",
        capability_decision: capabilityDecision,
        answer: pa2.answer,
        response_format_version: "v2_pa2_sections",
        synth_version: pa2.synth_version,
        capability_plan: capabilityPlan,
        context_bridge: contextBridge,
        router: primaryDecision,
        display_node: {
          node_id: "pa2",
          node_label: "Parenting Intelligence Node",
          reason: "PA2 domain synthesis contract"
        },
        sources: sourceJson,
        primary: execRes.data,
        qa: qaJson
      });
    }
    const synthesized = synthesizeHx2Answer({
      router: primaryDecision,
      display_node: displayNode,
      primary: execRes.data,
      qa: qaJson,
      sources: sourceJson,
      capability_plan: capabilityPlan,
      context_bridge: contextBridge,
      formatted_answer: formatted.answer,
    });

    return NextResponse.json({
      ok: true,
      chat_master_version: "v2_capability_planner",
      capability_decision: capabilityDecision,
      answer: synthesized.answer,
      response_format_version: formatted.format_version,
      synth_version: synthesized.synth_version,
      capability_plan: capabilityPlan,
      context_bridge: contextBridge,
      router: primaryDecision,
      display_node: displayNode,
      sources: sourceJson,
      primary: execRes.data,
      qa: qaJson,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "chat-master error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}




















































import { getCheapLocalAnswer } from "./cheap-local";
import { classifyIntent } from "./intent-classifier";

function extractResponseText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();

  const parts: string[] = [];

  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (typeof c?.text === "string") parts.push(c.text);
          if (typeof c?.content === "string") parts.push(c.content);
        }
      }
    }
  }

  if (Array.isArray(data?.choices)) {
    for (const ch of data.choices) {
      if (typeof ch?.message?.content === "string") parts.push(ch.message.content);
      if (typeof ch?.text === "string") parts.push(ch.text);
    }
  }

  return parts.join("\n").trim();
}

export async function buildGeneralHx2Answer(input: {
  query: string;
  contextBridge?: any;
  intent?: string;
  sources?: any;
}) {
  const cheap = getCheapLocalAnswer(input.query);
  if (cheap) return cheap;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      answer: "OPENAI_API_KEY missing.",
      synth_version: "v1_missing_key"
    };
  }

  const intent = input.intent || classifyIntent(input.query);

  const system =
    intent === "research"
      ? [
          "You are HX2 Research Intelligence.",
          "Use only the supplied source signals/results.",
          "Do not invent dates, prices, events, or context.",
          "If a claim is not confirmed by the source set, say it is not confirmed.",
          "Use this structure: Quick Read, Confirmed Signals, Signal vs Noise, What Matters, Source Highlights."
        ].join(" ")
      : intent === "builder"
      ? [
          "You are HX2 Builder Intelligence operating under DEV2 discipline.",
          "Use this structure: Quick Read, Most Likely Causes, First Commands to Run, Exact Fix Path, Validation, Commit/Deploy, Rollback Note, What to Paste Back.",
          "Prefer PowerShell commands. Avoid vague advice."
        ].join(" ")
      : intent === "business"
      ? [
          "You are HX2 Business Intelligence.",
          "Use this structure: Quick Read, Highest-Leverage Moves, 7-Day Action Plan, Follow-Up System, Metrics to Track.",
          "Prioritize leads, offers, conversion, follow-up, positioning, and low-cost execution."
        ].join(" ")
      : intent === "health"
      ? [
          "You are HX2 Health Intelligence.",
          "Give practical educational wellness guidance.",
          "No diagnosis. Start direct. Include cautions only when relevant."
        ].join(" ")
      : [
          "You are HX2 General Intelligence.",
          "Answer clearly, accurately, and practically.",
          "Use concise premium formatting."
        ].join(" ");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.HX2_GENERAL_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: input.query }
      ],
      max_output_tokens: 1000
    })
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      answer: [
        "HX2 general fallback failed.",
        "",
        "Status: " + res.status,
        "Error: " + JSON.stringify(data).slice(0, 800)
      ].join("\n"),
      synth_version: `v2_general_llm_${intent}_error`
    };
  }

  const text = extractResponseText(data);

  return {
    answer: text || JSON.stringify(data).slice(0, 1000),
    synth_version: `v2_general_llm_${intent}`
  };
}

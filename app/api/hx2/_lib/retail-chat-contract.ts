export type Hx2RetailParticipation = {
  retrieval: boolean;
  orchestrator: boolean;
  kgx: boolean;
  signals: string[];
};

export type Hx2RetailSafeMetadata = {
  contract_version: "retail_chat_contract_v1";
  generated_at: string;
  source: string;
  preview: boolean;
  no_brain_logic: true;
  no_internal_prompts: true;
  no_internal_weights: true;
};

export type Hx2RetailChatContract = {
  ok: boolean;
  answer: string;
  mode: string;
  route: string;
  request_id: string;
  participation: Hx2RetailParticipation;
  warnings: string[];
  safe_metadata: Hx2RetailSafeMetadata;
  raw_preview: {
    response_shape: string[];
  };
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    const text = asString(value).trim();
    if (text) return text;
  }
  return "";
}

function safeKeys(value: unknown): string[] {
  if (!isRecord(value)) return [];
  return Object.keys(value).sort();
}

function stringifyForSignalScan(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return String(value ?? "");
  }
}

function hasAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function collectSignals(text: string): string[] {
  const signals: string[] = [];

  if (hasAny(text, ["retrieval", "retrieved", "source", "sources", "citation", "evidence", "document"])) {
    signals.push("retrieval");
  }

  if (hasAny(text, ["orchestrator", "planner", "route", "routing", "capability", "intent", "mode"])) {
    signals.push("orchestrator");
  }

  if (hasAny(text, ["kgx", "memory", "graph", "node", "context", "lineage"])) {
    signals.push("kgx");
  }

  return Array.from(new Set(signals)).sort();
}

function detectLeakMarker(text: string): string[] {
  const forbidden = [
    "SYSTEM_PROMPT:",
    "DEVELOPER_MESSAGE:",
    "HIDDEN_PROMPT:",
    "CHAIN_OF_THOUGHT:",
    "PRIVATE_REASONING:",
    "INTERNAL_WEIGHTS:",
    "SCORING_WEIGHTS:",
    "CONFLUENCE_WEIGHTS:",
    "__INTERNAL_PROMPT__",
    "__SYSTEM_PROMPT__",
    "__DEVELOPER_MESSAGE__",
    "nodeWeights",
    "scoringWeights",
    "confluenceWeights",
    "developerMessage",
    "systemPrompt"
  ];

  return forbidden.filter((term) => text.includes(term));
}

export function buildHx2RetailChatContract(input: unknown): Hx2RetailChatContract {
  const record = isRecord(input) ? input : {};
  const result = isRecord(record.result) ? record.result : {};
  const data = isRecord(record.data) ? record.data : {};

  const requestId = firstString(
    record.request_id,
    record.requestId,
    result.request_id,
    result.requestId,
    data.request_id,
    data.requestId
  ) || `hx2-retail-contract-${Date.now()}`;

  const mode = firstString(record.mode, result.mode, data.mode) || "safe_preview";

  const route = firstString(record.route, result.route, data.route) || "/api/hx2/retail-chat-contract-preview";

  const answer = firstString(
    record.answer,
    record.response,
    record.message,
    record.content,
    record.text,
    result.answer,
    result.response,
    result.message,
    result.content,
    result.text,
    data.answer,
    data.response,
    data.message,
    data.content,
    data.text
  ) || "HX2 safe preview response is available.";

  const scanText = stringifyForSignalScan(input) + " " + answer + " " + mode + " " + route;
  const signals = collectSignals(scanText);
  const leakMarkers = detectLeakMarker(scanText);

  const warnings: string[] = [];

  if (!answer.trim()) {
    warnings.push("missing_answer_text");
  }

  if (!signals.includes("retrieval")) {
    warnings.push("retrieval_participation_not_visible");
  }

  if (!signals.includes("orchestrator")) {
    warnings.push("orchestrator_participation_not_visible");
  }

  if (!signals.includes("kgx")) {
    warnings.push("kgx_participation_not_visible");
  }

  if (leakMarkers.length > 0) {
    warnings.push("internal_marker_detected");
  }

  return {
    ok: leakMarkers.length === 0,
    answer,
    mode,
    route,
    request_id: requestId,
    participation: {
      retrieval: signals.includes("retrieval"),
      orchestrator: signals.includes("orchestrator"),
      kgx: signals.includes("kgx"),
      signals
    },
    warnings,
    safe_metadata: {
      contract_version: "retail_chat_contract_v1",
      generated_at: new Date().toISOString(),
      source: "retail-chat-contract",
      preview: true,
      no_brain_logic: true,
      no_internal_prompts: true,
      no_internal_weights: true
    },
    raw_preview: {
      response_shape: safeKeys(input)
    }
  };
}

export function buildHx2RetailContractSample(): Hx2RetailChatContract {
  return buildHx2RetailChatContract({
    answer: "HX2 safe preview chat path is responding through the retail contract surface.",
    mode: "safe_preview",
    route: "/api/hx2/retail-chat-contract-preview",
    request_id: "hx2-retail-contract-sample",
    retrieval: "retrieval visible",
    orchestrator: "orchestrator route visible",
    kgx: "kgx context visible"
  });
}

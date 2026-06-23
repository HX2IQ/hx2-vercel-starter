export type Hx2RetailChatParticipation = {
  retrieval: boolean;
  orchestrator: boolean;
  kgx: boolean;
  signals: string[];
};

export type Hx2RetailChatSafeMetadata = {
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
  participation: Hx2RetailChatParticipation;
  warnings: string[];
  safe_metadata: Hx2RetailChatSafeMetadata;
  raw_preview?: {
    response_shape?: string[];
  };
};

export type Hx2RetailChatEnvelope = {
  ok: boolean;
  mode: string;
  route: string;
  upstream_route?: string;
  upstream_ok?: boolean;
  upstream_status?: number;
  ip_firewall?: "safe_metadata_only_no_brain_logic";
  contract: Hx2RetailChatContract;
};

export type Hx2RetailConsumerPreference = {
  ok: true;
  mode: "read_only_consumer_preference";
  contract_version: "retail_chat_consumer_preference_v1";
  preferred_endpoint: "/api/hx2/retail-chat-master-contract-preview";
  preferred_contract: "retail_chat_contract_v1";
  fallback_endpoints: string[];
  deprecated_direct_endpoints: string[];
  consumer_rules: {
    prefer_retail_contract: true;
    require_answer_field: true;
    require_participation_object: true;
    require_safe_metadata: true;
    no_brain_logic: true;
    no_internal_prompts: true;
    no_internal_weights: true;
  };
  display_contract: {
    answer_path: "contract.answer";
    mode_path: "contract.mode";
    route_path: "contract.route";
    request_id_path: "contract.request_id";
    participation_path: "contract.participation";
    warnings_path: "contract.warnings";
    safe_metadata_path: "contract.safe_metadata";
  };
  warnings: string[];
};

export type Hx2RetailConsumerPreferenceEnvelope = {
  ok: boolean;
  mode: "read_only_consumer_preference";
  route: "/api/hx2/retail-chat-consumer-preference";
  ip_firewall?: "safe_metadata_only_no_brain_logic";
  preference: Hx2RetailConsumerPreference;
};

export type Hx2RetailChatClientOptions = {
  baseUrl?: string;
  preferenceEndpoint?: string;
  preferredEndpoint?: string;
  fetchImpl?: typeof fetch;
};

export type Hx2RetailChatSendInput = {
  message: string;
  requestId?: string;
  mode?: "safe_preview";
  readOnly?: boolean;
  dryRun?: boolean;
  noPersist?: boolean;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) return path;
  return `${trimTrailingSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}

function makeRequestId(): string {
  return `hx2-retail-client-${Date.now()}`;
}

function assertFetch(fetchImpl?: typeof fetch): typeof fetch {
  const activeFetch = fetchImpl ?? globalThis.fetch;

  if (!activeFetch) {
    throw new Error("HX2 retail chat client requires fetch.");
  }

  return activeFetch;
}

function assertRetailContractEnvelope(value: unknown): asserts value is Hx2RetailChatEnvelope {
  if (!value || typeof value !== "object") {
    throw new Error("HX2 retail chat response was not an object.");
  }

  const envelope = value as Partial<Hx2RetailChatEnvelope>;

  if (!envelope.contract || typeof envelope.contract !== "object") {
    throw new Error("HX2 retail chat response missing contract.");
  }

  if (typeof envelope.contract.answer !== "string") {
    throw new Error("HX2 retail chat contract missing answer.");
  }

  if (!envelope.contract.participation || typeof envelope.contract.participation !== "object") {
    throw new Error("HX2 retail chat contract missing participation object.");
  }

  if (!envelope.contract.safe_metadata || typeof envelope.contract.safe_metadata !== "object") {
    throw new Error("HX2 retail chat contract missing safe_metadata.");
  }

  if (envelope.contract.safe_metadata.contract_version !== "retail_chat_contract_v1") {
    throw new Error("HX2 retail chat contract version mismatch.");
  }
}

function assertConsumerPreferenceEnvelope(value: unknown): asserts value is Hx2RetailConsumerPreferenceEnvelope {
  if (!value || typeof value !== "object") {
    throw new Error("HX2 retail consumer preference response was not an object.");
  }

  const envelope = value as Partial<Hx2RetailConsumerPreferenceEnvelope>;

  if (!envelope.preference || typeof envelope.preference !== "object") {
    throw new Error("HX2 retail consumer preference response missing preference.");
  }

  if (envelope.preference.preferred_endpoint !== "/api/hx2/retail-chat-master-contract-preview") {
    throw new Error("HX2 retail consumer preference preferred endpoint mismatch.");
  }

  if (envelope.preference.preferred_contract !== "retail_chat_contract_v1") {
    throw new Error("HX2 retail consumer preference preferred contract mismatch.");
  }

  if (!envelope.preference.consumer_rules?.prefer_retail_contract) {
    throw new Error("HX2 retail consumer preference does not prefer retail contract.");
  }
}

export async function getHx2RetailChatConsumerPreference(
  options: Hx2RetailChatClientOptions = {}
): Promise<Hx2RetailConsumerPreferenceEnvelope> {
  const fetchImpl = assertFetch(options.fetchImpl);
  const endpoint = options.preferenceEndpoint ?? "/api/hx2/retail-chat-consumer-preference";
  const url = joinUrl(options.baseUrl ?? "", endpoint);

  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-hx2-client-helper": "retail_chat_client_v1"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`HX2 retail consumer preference request failed: ${response.status}`);
  }

  const data = await response.json();
  assertConsumerPreferenceEnvelope(data);

  return data;
}

export async function sendHx2RetailChatMessage(
  input: Hx2RetailChatSendInput,
  options: Hx2RetailChatClientOptions = {}
): Promise<Hx2RetailChatEnvelope> {
  const fetchImpl = assertFetch(options.fetchImpl);

  if (!input.message || !input.message.trim()) {
    throw new Error("HX2 retail chat client requires a message.");
  }

  const preference =
    options.preferredEndpoint
      ? null
      : await getHx2RetailChatConsumerPreference(options);

  const endpoint =
    options.preferredEndpoint ??
    preference?.preference.preferred_endpoint ??
    "/api/hx2/retail-chat-master-contract-preview";

  const url = joinUrl(options.baseUrl ?? "", endpoint);

  const requestId = input.requestId ?? makeRequestId();

  const payload = {
    message: input.message,
    prompt: input.message,
    q: input.message,
    input: input.message,
    messages: [
      {
        role: "user",
        content: input.message
      }
    ],
    mode: input.mode ?? "safe_preview",
    safePreview: true,
    preview: true,
    readOnly: input.readOnly ?? true,
    dryRun: input.dryRun ?? true,
    noPersist: input.noPersist ?? true,
    request_id: requestId,
    requestId,
    source: "hx2-retail-chat-client",
    ipFirewall: "safe_metadata_only_no_brain_logic"
  };

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-hx2-client-helper": "retail_chat_client_v1"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`HX2 retail chat request failed: ${response.status}`);
  }

  const data = await response.json();
  assertRetailContractEnvelope(data);

  return data;
}

export function getHx2RetailAnswerText(envelope: Hx2RetailChatEnvelope): string {
  return envelope.contract.answer;
}

export function getHx2RetailParticipation(envelope: Hx2RetailChatEnvelope): Hx2RetailChatParticipation {
  return envelope.contract.participation;
}

export function getHx2RetailWarnings(envelope: Hx2RetailChatEnvelope): string[] {
  return envelope.contract.warnings ?? [];
}

import { buildHx2RetailChatContract } from "../_lib/retail-chat-contract";

export const dynamic = "force-dynamic";

const ROUTE = "/api/hx2/retail-chat-master-contract-preview";
const CHAT_MASTER_ROUTE = "/api/hx2/chat-master";

function makeRequestId() {
  return `hx2-retail-chat-master-${Date.now()}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return asRecord(await request.json());
  } catch {
    return {};
  }
}

function buildSafePreviewPayload(body: Record<string, unknown>) {
  const message =
    firstText(body.message, body.prompt, body.q, body.input) ||
    "HX2 retail chat-master contract preview. Return one short public status answer.";

  const requestId = firstText(body.request_id, body.requestId) || makeRequestId();

  return {
    ...body,
    message,
    prompt: message,
    q: message,
    input: message,
    messages: [
      {
        role: "user",
        content: message
      }
    ],
    mode: "safe_preview",
    preview: true,
    safePreview: true,
    dryRun: true,
    readOnly: true,
    noPersist: true,
    source: "retail-chat-master-contract-preview",
    request_id: requestId,
    requestId,
    ipFirewall: "safe_metadata_only_no_brain_logic"
  };
}

async function callChatMaster(request: Request, payload: Record<string, unknown>) {
  const origin = new URL(request.url).origin;

  try {
    const response = await fetch(`${origin}${CHAT_MASTER_ROUTE}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hx2-safe-preview": "true",
        "x-hx2-contract-bridge": "retail_chat_contract_v1"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = {
        answer: await response.text()
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: {
        answer: "HX2 chat-master safe preview was not reachable from the retail contract bridge.",
        warning: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

export async function GET() {
  const contract = buildHx2RetailChatContract({
    answer: "HX2 retail chat-master contract bridge is available.",
    mode: "read_only_preview",
    route: ROUTE,
    request_id: "hx2-retail-chat-master-contract-get",
    retrieval: "retrieval participation field available",
    orchestrator: "orchestrator participation field available",
    kgx: "kgx participation field available"
  });

  return Response.json({
    ok: contract.ok,
    mode: "read_only_preview",
    route: ROUTE,
    upstream_route: CHAT_MASTER_ROUTE,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    contract
  });
}

export async function POST(request: Request) {
  const body = await readBody(request);
  const payload = buildSafePreviewPayload(body);
  const upstream = await callChatMaster(request, payload);

  const contract = buildHx2RetailChatContract({
    ...asRecord(upstream.data),
    route: ROUTE,
    mode: "safe_preview",
    request_id: payload.request_id,
    upstream_route: CHAT_MASTER_ROUTE,
    upstream_status: upstream.status,
    orchestrator: "chat-master bridge route",
    retrieval: "safe preview retrieval participation check",
    kgx: "safe preview kgx participation check"
  });

  return Response.json({
    ok: contract.ok,
    mode: "safe_preview",
    route: ROUTE,
    upstream_route: CHAT_MASTER_ROUTE,
    upstream_ok: upstream.ok,
    upstream_status: upstream.status,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    contract
  });
}

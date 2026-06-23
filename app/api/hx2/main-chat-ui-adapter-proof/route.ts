import {
  getHx2MainChatUiAdapterConfig,
  sendHx2MainChatUiMessage
} from "../../../../lib/hx2-main-chat-ui-adapter";

export const dynamic = "force-dynamic";

const ROUTE = "/api/hx2/main-chat-ui-adapter-proof";

function getOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET() {
  return Response.json({
    ok: true,
    mode: "read_only_main_chat_ui_adapter_proof",
    route: ROUTE,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    adapter: getHx2MainChatUiAdapterConfig()
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message
      : "HX2 main chat UI adapter proof. Return one short public safe-preview status sentence.";

  const result = await sendHx2MainChatUiMessage({
    message,
    requestId:
      typeof body.request_id === "string"
        ? body.request_id
        : "hx2-main-chat-ui-adapter-proof",
    baseUrl: getOrigin(request)
  });

  return Response.json({
    ok: true,
    mode: "read_only_main_chat_ui_adapter_proof",
    route: ROUTE,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    adapter: getHx2MainChatUiAdapterConfig(),
    result
  });
}

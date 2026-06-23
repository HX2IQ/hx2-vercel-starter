import { buildHx2RetailChatConsumerPreference } from "../_lib/retail-chat-consumer-preference";

export const dynamic = "force-dynamic";

const ROUTE = "/api/hx2/retail-chat-consumer-preference";

export async function GET() {
  const preference = buildHx2RetailChatConsumerPreference();

  return Response.json({
    ok: true,
    mode: "read_only_consumer_preference",
    route: ROUTE,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    preference
  });
}

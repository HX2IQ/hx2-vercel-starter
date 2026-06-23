import {
  buildHx2RetailChatContract,
  buildHx2RetailContractSample
} from "../_lib/retail-chat-contract";

export const dynamic = "force-dynamic";

const ROUTE = "/api/hx2/retail-chat-contract-preview";

export async function GET() {
  return Response.json({
    ok: true,
    mode: "read_only_preview",
    route: ROUTE,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    contract: buildHx2RetailContractSample()
  });
}

export async function POST(request: Request) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const contract = buildHx2RetailChatContract({
    ...(typeof body === "object" && body !== null ? body : {}),
    route: ROUTE,
    mode: "safe_preview"
  });

  return Response.json({
    ok: contract.ok,
    mode: "safe_preview",
    route: ROUTE,
    ip_firewall: "safe_metadata_only_no_brain_logic",
    contract
  });
}

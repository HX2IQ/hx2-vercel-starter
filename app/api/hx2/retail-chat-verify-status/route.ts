import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "read_only_retail_chat_verify_status",
    route: "/api/hx2/retail-chat-verify-status",
    generated_at: new Date().toISOString(),
    ip_firewall: "safe_metadata_only_no_brain_logic",
    retail_chat_verification_bundle: {
      status: "active",
      command: "npm run hx2:retail-chat:verify",
      local_command: "npm run hx2:retail-chat:verify:local",
      strict_command: "npm run hx2:retail-chat:verify:strict",
      purpose:
        "Runs the retail-safe chat verification bundle before or after chat/UI changes.",
      checks: [
        "main_chat_user_flow",
        "main_chat_ui_wiring",
        "embedded_healthoi_chat_wiring",
        "direct_endpoint_cleanup_report",
        "direct_endpoint_allowlist_guard",
        "chat_e2e_safe_preview",
        "answer_quality_participation",
        "auto_verify"
      ]
    },
    next_safe_step:
      "Run npm run hx2:retail-chat:verify before future chat or UI changes."
  });
}

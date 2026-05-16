import { NextResponse } from "next/server";

import { CHAT_MASTER_KEYWORDS } from "../contracts/chat-master-keywords";
import { CHAT_MASTER_EXECUTION_MAP } from "../contracts/chat-master-execution-map";

export const runtime = "nodejs";

export async function GET() {

  const intents =
    Object.keys(CHAT_MASTER_EXECUTION_MAP);

  const diagnostics =
    intents.map((intent) => ({

      intent,

      keywords:
        CHAT_MASTER_KEYWORDS[
          intent as keyof typeof CHAT_MASTER_KEYWORDS
        ] || [],

      keyword_count:
        (
          CHAT_MASTER_KEYWORDS[
            intent as keyof typeof CHAT_MASTER_KEYWORDS
          ] || []
        ).length,

      execution_target:
        CHAT_MASTER_EXECUTION_MAP[
          intent as keyof typeof CHAT_MASTER_EXECUTION_MAP
        ]?.node || "unknown"

    }));

  return NextResponse.json({
    ok: true,
    diagnostics,
    intent_count: diagnostics.length
  });
}

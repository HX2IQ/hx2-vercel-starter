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
        ]?.node || "unknown",

      confidence_estimate:
        intent === "general"
          ? 0.5
          : 0.8

    }));

  const sample_queries = [
    { intent: "health", query: "Is creatine safe daily?" },
    { intent: "markets", query: "Latest XRP market news" },
    { intent: "legal", query: "How do I respond to a trademark office action?" },
    { intent: "parenting", query: "My child hates reading homework" },
    { intent: "developer", query: "Why did the Next.js build fail?" },
    { intent: "general", query: "What is the best plan today?" }
  ];

  const confidence_distribution = {
    high_confidence:
      diagnostics.filter((x) => x.confidence_estimate >= 0.8).length,

    medium_confidence:
      diagnostics.filter((x) => x.confidence_estimate >= 0.6 && x.confidence_estimate < 0.8).length,

    low_confidence:
      diagnostics.filter((x) => x.confidence_estimate < 0.6).length
  };

  return NextResponse.json({
    ok: true,
    diagnostics,
    intent_count: diagnostics.length,
    confidence_distribution,
    sample_queries
  });
}



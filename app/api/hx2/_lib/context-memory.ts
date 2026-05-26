type Msg = { role?: string; content?: string };

type MemoryState = {
  topic: string;
  last_user_query: string;
  last_mode: string;
  last_summary: string;
};

export function inferCarryTopic(
  query: string,
  conversation: Msg[] = []
) {
  const q = (query || "").toLowerCase().trim();

  const shortFollowup =
    q.length < 100 &&
    /^(is it|safe|best brand|best one|should i|worth it|daily|every day|dose|dosage|how much|side effects|can i take|what about|does it|can it)/i.test(q);

  if (!shortFollowup) return null;

  const joined = conversation
    .map((x) => x?.content || "")
    .join(" ")
    .toLowerCase();

  if (/aged garlic|age garlic|kyolic|aged garlic extract/.test(joined)) return "aged garlic extract";
  if (/creatine/.test(joined)) return "creatine";
  if (/berberine/.test(joined)) return "berberine";
  if (/magnesium glycinate/.test(joined)) return "magnesium glycinate";
  if (/magnesium/.test(joined)) return "magnesium";

  return null;
}

export function buildMemoryState(input: {
  userQuery: string;
  mode?: string;
  priorAnswer?: string;
}): MemoryState {
  return {
    topic: inferTopic(input.userQuery),
    last_user_query: input.userQuery,
    last_mode: input.mode || "general",
    last_summary: summarize(input.priorAnswer || "")
  };
}

function inferTopic(q: string): string {
  const s = (q || "").toLowerCase();

  if (s.includes("deploy") || s.includes("build") || s.includes("vercel")) return "builder";
  if (s.includes("lead") || s.includes("sales") || s.includes("marketing")) return "business";
  if (s.includes("creatine") || s.includes("supplement") || s.includes("health") || s.includes("garlic")) return "health";

  return "general";
}

function summarize(t: string): string {
  return String(t || "").replace(/\s+/g, " ").trim().slice(0, 220);
}

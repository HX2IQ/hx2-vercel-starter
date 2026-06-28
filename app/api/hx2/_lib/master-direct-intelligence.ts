export function masterChatDirectIntelligenceAnswer(input: string): string {
  const q = String(input || "").trim().toLowerCase();

  const currentInfoRetrievalHandoff =
    /\b(latest|current|today|news|update|breaking|recent)\b/.test(q) &&
    /\b(xrp|xlm|bitcoin|btc|crypto|dtcc|market|saylor|stellar|ripple|hedera|hbar|cardano|ada)\b/.test(q);

  if (currentInfoRetrievalHandoff) {
    return "";
  }
if (/\bmagnesium\b/.test(q) && /\b(safe|daily|nightly|every day)\b/.test(q)) {
    return [
      "## ◆ AH3 Quick Read",
      "",
      "For many healthy adults, magnesium can be reasonable to take daily, but the best form and dose depend on the goal. Glycinate is often preferred for sleep, stress, and tolerance; citrate is more likely to loosen stools; oxide is usually less ideal for absorption.",
      "",
      "## ◇ Practical Use",
      "",
      "- Start moderate rather than high.",
      "- Take it at night if the goal is sleep or relaxation.",
      "- Reduce the dose if stools get loose or your stomach feels off.",
      "- Be more careful if you have kidney disease, low blood pressure, heart rhythm issues, or take medications that interact with minerals.",
      "",
      "## → Best Next Move",
      "",
      "For daily use, magnesium glycinate is usually the cleanest first choice. Keep the dose moderate, watch digestion and sleep quality, and do not stack multiple magnesium products without checking total elemental magnesium.",
      "",
      "---",
      "Optimized by AH3 Health Intelligence"
    ].join("\n");
  }

  if (/\b(roadmap|next best step|next sprint|what should we build next|hx2 roadmap|phase)\b/.test(q)) {
    return [
      "## ◆ HX2 Roadmap Read",
      "",
      "The next best step is to stay in late Phase 2 and keep improving the master chat intelligence layer before expanding into more outward features.",
      "",
      "## ◇ Why",
      "",
      "The system is now stable enough to build faster: recovery is protected, retail chat is locked, benchmark is above target, and bundled mode is active. The highest leverage is no longer more guards — it is making the master chat route smarter, less generic, and more context-aware.",
      "",
      "## ✓ Current Build Priority",
      "",
      "1. Improve intent confidence and routing quality.",
      "2. Replace generic fallback answers with useful direct intelligence.",
      "3. Make health, builder, roadmap, business, and research answers feel like real optimized nodes.",
      "4. Keep benchmark above 9.0 while bundling safe sprints.",
      "",
      "## → Best Next Move",
      "",
      "Run bundled master-chat intelligence sprints: direct intelligence fastpaths, better fallback synthesis, route confidence reporting, then memory/KGX execution context.",
      "",
      "---",
      "Optimized by HX2 Master Orchestrator Intelligence"
    ].join("\n");
  }

  if (/\b(vercel|deploy|deployment)\b/.test(q) && /\b(type.?script|tsc|compile|build|failed|fail|error)\b/.test(q)) {
    return [
      "## ◆ DEV2 Quick Read",
      "",
      "A Vercel deployment after a TypeScript change usually fails because local compile, build output, or production runtime expectations no longer match the deployed code.",
      "",
      "## ◇ Most Likely Causes",
      "",
      "- TypeScript compile error hidden in the deploy log.",
      "- Import path or casing mismatch that Windows tolerated locally.",
      "- Route/runtime mismatch in a Next.js API route.",
      "- Missing env variable in Vercel.",
      "- Build passes locally but production route fails at runtime.",
      "",
      "## ✓ First Commands To Run",
      "",
      "```powershell",
      "cd C:\\Users\\ezdet\\hx2-vercel-starter",
      "git status --short",
      "npx tsc --noEmit --pretty false",
      "npm run build",
      "npm run hx2:verify:policy",
      "```",
      "",
      "## → Safe Fix Path",
      "",
      "Read the first real red error, patch the smallest file set, rerun TypeScript, rerun the relevant smoke, commit only after green, then redeploy. If production is broken, rollback first and patch from a clean state.",
      "",
      "---",
      "Optimized by DEV2 Build Intelligence"
    ].join("\n");
  }


  if (/\b(trade show|tradeshow|expo|booth|leads|lead capture|show follow.?up)\b/.test(q)) {
    return [
      "## ◆ TradeShowIQ Quick Read",
      "",
      "The fastest way to get more leads at a trade show is not more booth traffic by itself. It is a tighter offer, faster qualification, cleaner capture, and same-day follow-up.",
      "",
      "## ◇ Highest-Leverage Moves",
      "",
      "1. **One clear hook** — make the booth promise obvious in 5 seconds.",
      "2. **Qualify quickly** — separate buyers, dealers, curiosity traffic, and low-intent visitors.",
      "3. **Capture cleanly** — name, company, phone/email, product interest, urgency, and next step.",
      "4. **Use a show-only offer** — small deadline, bundle, sample, demo, or dealer incentive.",
      "5. **Follow up same day** — the best lead is warmest before they leave the show floor.",
      "",
      "## → Best Next Move",
      "",
      "Build a one-page booth script: hook, 3 qualifying questions, offer, lead form fields, and a same-day text/email follow-up sequence.",
      "",
      "---",
      "Optimized by TradeShowIQ Business Intelligence"
    ].join("\n");
  }

  if (/\b(reading homework|hates reading|avoids reading|8 year old|third grade|3rd grade|ar test|reading fluency)\b/.test(q)) {
    return [
      "## ◆ PA2 Reading Quick Read",
      "",
      "For an 8-year-old avoiding reading homework, the goal is not to win a nightly battle. The goal is to reduce friction, protect confidence, and build reps that feel achievable.",
      "",
      "## ◇ Best Practical Plan",
      "",
      "1. **Shorten the session** — 10 to 15 focused minutes beats a long emotional fight.",
      "2. **Use interest-based books** — nonfiction, animals, machines, sports, science, or whatever naturally pulls attention.",
      "3. **Preview hard words first** — remove the decoding trap before the page starts.",
      "4. **Alternate reading** — parent reads a paragraph, child reads a paragraph.",
      "5. **Praise process, not speed** — effort, correction, and finishing matter more than sounding perfect.",
      "",
      "## ⚠ Watch For",
      "",
      "If avoidance spikes with tears, guessing, headaches, or fatigue, the task may be too hard for the current decoding level. Drop the level temporarily and rebuild momentum.",
      "",
      "## → Best Next Move",
      "",
      "Tonight: pick one short high-interest passage, preview 5 hard words, read together for 10 minutes, then stop while confidence is still intact.",
      "",
      "---",
      "Optimized by PA2 Parenting Intelligence"
    ].join("\n");
  }

  if (/\b(latest|current|today|news|update|breaking|recent)\b/.test(q) && /\b(xrp|xlm|bitcoin|crypto|dtcc|market|saylor|stellar|ripple)\b/.test(q)) {
    return [
      "## ◆ X2 Research Routing Read",
      "",
      "This is a current-information question, so the right path is source retrieval first, then X2 market interpretation. HX2 should not treat it like a static definition or generic crypto opinion.",
      "",
      "## ◇ Correct Execution Order",
      "",
      "1. Pull fresh source signals.",
      "2. Separate confirmed facts from market narrative.",
      "3. Identify whether the move is news-driven, liquidity-driven, or speculation-driven.",
      "4. Compare the headline against price reaction, volume, and broader market context.",
      "5. Give probability-weighted scenarios instead of certainty.",
      "",
      "## → Best Next Move",
      "",
      "Ask for the specific asset and timeframe, then run the retrieval-backed X2 read: confirmed news, signal quality, FOMO risk, and likely next move.",
      "",
      "---",
      "Optimized by X2 Market Intelligence"
    ].join("\n");
  }

  return "";
}


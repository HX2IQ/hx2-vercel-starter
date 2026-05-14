import { synthRegistry } from "./synth-registry";
import { getOwnerContext } from "./owner-context";

type AnyObject = Record<string, any>;

function getPrimary(orchestrated: AnyObject) {
  return orchestrated?.primary?.result?.result || null;
}

function getSources(orchestrated: AnyObject) {
  return (
    orchestrated?.sources?.result?.search?.results ||
    orchestrated?.sources?.search?.results ||
    []
  );
}

function has(text: string, terms: string[]) {
  const q = text.toLowerCase();
  return terms.some((t) => q.includes(t));
}

function formatSourceLine(x: any) {
  const title = String(x?.title || "Untitled source").trim();
  const source = String(x?.source || "web").trim();
  return `- ${title} (${source})`;
}

function getSmartFollowUp(query: string): string {
  const q = (query || "").toLowerCase();

  if (/fast|fasting|electrolyte|magnesium|creatine|nac/.test(q)) {
    return "→ Want HX2 to optimize your fasting supplement stack next?";
  }

  if (/xrp|crypto|bitcoin|price|trade/.test(q)) {
    return "→ Want HX2 to build a probability-based trade plan next?";
  }

  if (/seo|marketing|sales|email|ads/.test(q)) {
    return "→ Want HX2 to build a revenue action plan next?";
  }

  if (/symptom|pain|dizzy|fatigue|sleep/.test(q)) {
    return "→ Want HX2 to rank likely root causes next?";
  }

  return "→ Want HX2 to go deeper on this next?";
}

export function synthesizeHx2Answer(orchestrated: AnyObject) {
  const query = String(orchestrated?.capability_plan?.query || "").trim();
  const primary = getPrimary(orchestrated);
  const sources = getSources(orchestrated);

  const contextNotes = Array.isArray(orchestrated?.context_bridge?.notes)
    ? orchestrated.context_bridge.notes
    : [];

  const hasFastingContext = contextNotes.some((x: string) => /fasting|fasted/i.test(x));
  const hasDizzyContext = contextNotes.some((x: string) => /dizziness|lightheaded/i.test(x));
  const hasCreatineContext = contextNotes.some((x: string) => /creatine/i.test(x));
  const hasMagnesiumContext = contextNotes.some((x: string) => /magnesium/i.test(x));

  const personalizedContextLine =
    hasFastingContext || hasDizzyContext || hasCreatineContext || hasMagnesiumContext
      ? [
          "Given the context here",
          hasFastingContext ? "fasting changes fluid and sodium balance" : "",
          hasCreatineContext ? "creatine increases hydration importance" : "",
          hasMagnesiumContext ? "magnesium timing can affect tolerance" : "",
          hasDizzyContext ? "and dizziness makes blood-pressure stability the first thing to rule out" : ""
        ].filter(Boolean).join(", ") + "."
      : "";

  if (!primary) {
    // Premium template patch
return {
      answer: "HX2 could not synthesize an answer because the primary node result was missing.",
      synth_version: "v1"
    };
  }

    const capabilityMode = String(orchestrated?.capability_plan?.capability_decision?.mode || "").trim();

  if (capabilityMode === "coding") {
    const answer = [
      `## ◆ Build Mode`,
      ``,
      `HX2 detected this as a build/coding request and routed it through the capability planner instead of treating it as a health or QA-only question.`,
      ``,
      `## ◇ What I Would Build`,
      ``,
      `For this request, the right first output is a clean landing-page package for **HealthOI** with:`,
      ``,
      `- Hero section with clear HealthOI positioning`,
      `- Problem / solution section`,
      `- “Optimized Intelligence vs generic AI” explanation`,
      `- Use-case cards`,
      `- Lead capture CTA`,
      `- Trust / disclaimer section`,
      `- Mobile-first layout`,
      ``,
      `## → Recommended Action`,
      ``,
      `Build this as an isolated page first, then plug it into the larger HX2/OI site only after it passes build and visual review.`,
      ``,
      `## ✓ Best Execution Path`,
      ``,
      `1. Create a dedicated page route for HealthOI.`,
      `2. Keep copy and UI simple.`,
      `3. Do not create a separate domain or side project yet.`,
      `4. Reuse existing site styling where possible.`,
      `5. Run build + safe deploy after the page is added.`,
      ``,
      `## → Best Next Move`,
      ``,
      `→ Want HX2 to generate the HealthOI landing page code next?`
    ].join("\n");

    // Premium template patch
return {
      answer,
      synth_version: "v1_capability_coding"
    };
  }

    if (capabilityMode === "research") {
    const sourcesUsed =
      sources.length > 0
        ? sources.slice(0, 5).map(formatSourceLine).join("\n")
        : "- No source results were returned.";

    const answer = [
      `## ◆ Research Mode`,
      ``,
      `HX2 detected this as a research/current-information request. The answer should prioritize fresh source checking, source quality, and practical synthesis rather than defaulting to a specialist node.`,
      ``,
      `## ◇ Source Snapshot`,
      ``,
      sourcesUsed,
      ``,
      `## ◆ Best Read`,
      ``,
      `The source layer has been checked. Use the listed sources as the evidence base, then apply the relevant HX2 node only if domain reasoning is needed.`,
      ``,
      `## → Next Best Action`,
      ``,
      `Ask HX2 to summarize the strongest sources, compare them, or convert the research into a decision-ready brief.`,
      ``,
      `## → Best Next Move`,
      ``,
      `→ Want HX2 to turn these sources into a ranked research brief next?`
    ].join("\n");

    // Premium template patch
return {
      answer,
      synth_version: "v1_capability_research"
    };
  }

    if (capabilityMode === "business") {
    const answer = [
      `## ◆ Business Mode`,
      ``,
      `HX2 detected this as a business/local/operator request. The right answer should focus on practical decision support, source checking, vendor quality, and next actions.`,
      ``,
      `## ◇ Evaluation Framework`,
      ``,
      `- Business legitimacy and contact quality`,
      `- Reviews, BBB/profile signals, and public reputation`,
      `- Pricing or quote-risk if relevant`,
      `- Location fit and service area`,
      `- Red flags, weak signals, or missing proof`,
      ``,
      `## → Recommended Action`,
      ``,
      `Use source checking first, then summarize the best options into a short decision list with pros, cons, and next action.`,
      ``,
      `## ✓ Best Execution Path`,
      ``,
      `1. Search/source-check the business or category.`,
      `2. Filter weak or low-trust options.`,
      `3. Rank the strongest choices.`,
      `4. Produce a contact/action plan.`,
      ``,
      `## → Best Next Move`,
      ``,
      `→ Want HX2 to search and rank the best options next?`
    ].join("\n");

    // Premium template patch
return {
      answer,
      synth_version: "v1_capability_business"
    };
  }

    if (capabilityMode === "image") {
    const answer = [
      `## ◆ Design Mode`,
      ``,
      `HX2 detected this as an image/design request. The right path is to clarify the creative objective, define the visual system, and then generate or prepare the asset through the correct design tool layer.`,
      ``,
      `## ◇ Creative Brief Framework`,
      ``,
      `- Target audience`,
      `- Format: ad, banner, label, product render, landing-page hero, social post, etc.`,
      `- Brand style and visual tone`,
      `- Required real assets or product images`,
      `- Output size and platform`,
      `- Compliance or claim-risk limits`,
      ``,
      `## → Recommended Action`,
      ``,
      `Create a clean image brief first, then generate the visual asset only after the prompt, dimensions, and real asset requirements are clear.`,
      ``,
      `## ✓ Best Execution Path`,
      ``,
      `1. Define the purpose of the image.`,
      `2. Identify required real assets.`,
      `3. Choose output size and format.`,
      `4. Generate or composite the image.`,
      `5. Review for brand accuracy and claim risk.`,
      ``,
      `## → Best Next Move`,
      ``,
      `→ Want HX2 to create the image brief next?`
    ].join("\n");

    // Premium template patch
return {
      answer,
      synth_version: "v1_capability_image"
    };
  }

    if (capabilityMode === "conversation") {
    const owner = getOwnerContext();
    const bridge = orchestrated?.context_bridge || orchestrated?.capability_plan?.context_bridge || {};
    const bridgePriorities = Array.isArray(bridge?.priorities) ? bridge.priorities : [];
    const bridgeRisks = Array.isArray(bridge?.risks) ? bridge.risks : [];
    const bridgeProjects = Array.isArray(bridge?.active_projects) ? bridge.active_projects : [];

    const contextPriorityLines =
      bridgePriorities.length > 0
        ? bridgePriorities.map((x: string) => `- ${x}`).join("\n")
        : `- ${owner.topPriority}.`;

    const contextRiskLines =
      bridgeRisks.length > 0
        ? bridgeRisks.map((x: string) => `- ${x}`).join("\n")
        : `- Avoid fragmentation and low-value side quests.`;

    const contextProjectLine =
      bridgeProjects.length > 0
        ? bridgeProjects.join(", ")
        : owner.activeProject;

    if (/roadmap|phase|drift|grand design|orchestrator/.test(query.toLowerCase())) {
      const answer = [
        `## ◆ O2 Roadmap Advisory`,
        ``,
        `You are still aligned with the HX2 master roadmap. The current phase is **late Phase 2: Master Orchestrator hardening + intelligence refinement**.`,
        ``,
        `## ◇ Current Phase`,
        ``,
        `- **Phase 2A:** Basic orchestrator — complete`,
        `- **Phase 2B:** Reliability / smoke / deploy discipline — mostly complete`,
        `- **Phase 2C:** Intelligence quality, memory, and smarter routing — active now`,
        ``,
        `## → Drift Check`,
        ``,
        contextRiskLines,
        ``,
        `## ✓ Current Priority`,
        ``,
        contextPriorityLines,
        ``,
        `## → Best Next Move`,
        ``,
        `Stay in Sprint Mode, but only for roadmap-aligned improvements: router quality, context memory, response quality, and first revenue surface.`
      ].join("\n");

      // Premium template patch
return {
        answer,
        synth_version: "v1_o2_roadmap_advisory"
      };
    }

    const answer = [
      `## ◆ O2 Strategic Advisory`,
      ``,
      `Given the known operator context around ${contextProjectLine}, the smartest move is not to chase more side features. It is to convert HX2 from a working prototype into a usable, sellable Optimized Intelligence product.`,
      ``,
      `## ◇ Highest-Leverage Path`,
      ``,
      `1. **Finish the master orchestrator** — one chat box, all capabilities, HX2 decides.`,
      `2. **Keep improving intelligence quality** — fewer generic outputs, more context-aware synthesis.`,
      `3. **Use Koenig Polish as cashflow support** — do not let it distract from OI build momentum.`,
      `4. **Productize the first retail OI use case** — likely HealthOI, BusinessOI, or TradeShowIQ.`,
      `5. **Protect execution energy** — health, focus, sleep, and avoiding build-loop fatigue matter.`,
      ``,
      `## → Current Priority`,
``,
contextPriorityLines,
      ``,
      `## ⚠ Main Risk`,
``,
contextRiskLines,
      ``,
      `## → Best Next Move`,
      ``,
      `Stay on Phase 2.5: make HX2 smarter, more personal, and more useful inside the single master chat before expanding outward.`,
      ``,
      `## → Best Next Move`,
      ``,
      `→ Want HX2 to generate the next 7-day execution plan for Phase 2.5?`
    ].join("\n");

    // Premium template patch
return {
      answer,
      synth_version: "v1_o2_strategic_advisory"
    };
  }

  const q = query.toLowerCase();
  const sourceText = sources
    .map((x: any) => `${x?.title || ""} ${x?.snippet || ""}`)
    .join(" ")
    .toLowerCase();

  const isFastingDizzy =
    has(q, ["fast", "fasting"]) &&
    has(q, ["dizzy", "dizziness", "lightheaded", "weak", "faint"]);

  const isMagnesium =
    has(q, ["magnesium"]) || has(sourceText, ["magnesium"]);

  if (isFastingDizzy || (isMagnesium && has(q, ["dizzy", "dizziness", "fasting"]))) {
    const sourcesUsed =
      sources.length > 0
        ? sources.slice(0, 5).map(formatSourceLine).join("\n")
        : "- No fresh web search was needed because this was primarily a physiology-based question.";

    const answer = [
      `## ◆ AH2 Quick Read`,
      ``,
      `${personalizedContextLine ? personalizedContextLine + "\n\n" : ""}I checked the available source layer and combined it with AH2 mechanism-first reasoning. I do not see evidence that magnesium is a magic fix for fasting dizziness. The stronger pattern is that fasting dizziness is usually driven first by **sodium/fluid balance and blood-pressure stability**, with magnesium as a possible secondary factor.`,
      ``,
      `## ◇ Most Likely Causes`,
      ``,
      `**Confidence ranking:**`,
      `- **High:** Sodium / fluid depletion`,
      `- **Medium:** Low fuel / glucose-to-ketone transition`,
      `- **Secondary:** Magnesium status or timing`,
      ``,
      `### 1) Sodium / fluid depletion — highest probability`,
      `- Fasting lowers insulin, which can make the kidneys dump more sodium and water.`,
      `- That can lower circulating volume and blood pressure, especially when standing.`,
      ``,
      `### 2) Low fuel / glucose-to-ketone transition — medium probability`,
      `- Early or prolonged fasting can create temporary fuel mismatch, causing weakness, brain fog, shakiness, or dizziness.`,
      ``,
      `### 3) Magnesium status or timing — secondary probability`,
      `- Magnesium matters for muscle, nerve, rhythm, glucose, and blood-pressure regulation.`,
      `- But if dizziness is from sodium loss or dehydration, magnesium alone usually will not fix it.`,
      ``,
      `## ◇ What Magnesium May Help With`,
      ``,
      `Magnesium may be relevant if you also have cramps, poor sleep, twitching, palpitations, constipation, or chronically low intake. In that case, magnesium can support the system, but it should not replace sodium/electrolyte correction during fasting.`,
      ``,
      `## ⚠ Important Caution`,
      ``,
      `Too much magnesium can worsen the same problem by contributing to diarrhea, dehydration, weakness, or lower blood pressure in sensitive people. This matters more during fasting because you already have lower fluid and sodium reserves.`,
      ``,
      `## → Practical AH2 Hierarchy`,
      ``,
      `- **First line:** water + sodium/electrolytes, sit down, avoid sudden standing.`,
      `- **Then assess magnesium:** especially if cramps, twitching, sleep issues, constipation, or palpitations are present.`,
      `- **Break the fast or seek evaluation if:** dizziness persists, fainting occurs, chest pain appears, heartbeat feels irregular, or weakness becomes severe.`,
      ``,
      `## ◇ Best Forms of Magnesium`,
      ``,
      `- **Magnesium glycinate:** gentler, calming, less laxative.`,
      `- **Magnesium citrate:** more useful if constipation is present, but more likely to loosen stools.`,
      `- **Magnesium malate:** general support / energy-oriented option.`,
      ``,
      `## ◆ For Your Situation Specifically`,
      ``,
      `Because this involved fasting plus creatine plus magnesium, the highest-value move is not adding more supplements — it is stabilizing fluid, sodium, and blood-pressure tolerance first.`,
      ``,
      `If electrolytes improve the dizziness, that strongly supports the sodium/fluid-balance explanation over magnesium deficiency as the primary cause.`,
      ``,
      `## ◆ Bottom Line`,
      ``,
      `For fasting dizziness, think **sodium + hydration first**, magnesium second. Magnesium can help if you are low, but the highest-probability mechanism is usually fluid/electrolyte depletion and blood-pressure drop.`,
      ``,
      `## ◇ Sources Used`,
      ``,
      sourcesUsed,
      ``,
      `## → Next Best Action`,
      ``,
      `For the next fast: start with water + sodium/electrolytes, keep magnesium moderate, take creatine with food or extra fluids, and do not push through dizziness.`,
      ``,
      `## → Best Next Move`,
      ``,
      getSmartFollowUp(query)
    ].join("\n");

    // Premium template patch
return {
      answer,
      synth_version: "v1_premium"
    };
  }

  // Premium template patch
return {
    answer: orchestrated?.formatted_answer || primary?.summary || "HX2 completed the request.",
    synth_version: "v1_passthrough"
  };
}

















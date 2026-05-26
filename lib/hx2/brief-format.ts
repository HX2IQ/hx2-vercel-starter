export function buildBriefFormatBlock(): string {
  const lines: string[] = [];

  lines.push("BRIEF_FORMAT_BLOCK:");
  lines.push("- Output must read like an elite intelligence brief, not a chat response.");
  lines.push("- Use this exact section order when applicable:");
  lines.push("- 1. Brief Title");
  lines.push("- 2. Primary Signal");
  lines.push("- 3. Supporting Context");
  lines.push("- 4. Implications");
  lines.push("- 5. Confidence");
  lines.push("- 6. Monitoring Priorities");
  lines.push("- Keep sections compressed and high-signal.");
  lines.push("- Prefer fewer, sharper bullets over broad coverage.");
  lines.push("- Make direct catalysts explicit and distinguish them from indirect backdrop.");
  lines.push("- Where useful, explicitly label evidence as Direct catalyst / Indirect backdrop / Narrative support.");
  lines.push("- Preserve those role labels exactly in the final answer; do not paraphrase them.");
  lines.push("- Do not let narrative support drive the final judgement over stronger source roles.");
  lines.push("- Do not relabel an item beyond its provided catalyst_label.");
  lines.push("- If the selected set contains zero direct_catalysts, the output must explicitly say: No direct catalyst present.");
  lines.push("- Confidence must reflect both source quality and source conflict.");
  lines.push("END_BRIEF_FORMAT_BLOCK");

  return lines.join("\n");
}


export function classifySignalNoise(sourceJson: any) {
  const results = sourceJson?.result?.search?.results || [];

  return results.map((r: any) => {
    const text = `${r.title || ""} ${r.snippet || ""}`.toLowerCase();

    let signal_score = 0;
    let noise_score = 0;
    const reasons: string[] = [];

    if (/sec|lawsuit|clarity act|regulation|senate|congress|etf|treasury|nasdaq|listing|partnership|bank|institutional/.test(text)) {
      signal_score += 4;
      reasons.push("Market/regulatory/institutional signal");
    }

    if (/price|volume|market cap|resistance|support|breakout|inflow|outflow/.test(text)) {
      signal_score += 3;
      reasons.push("Market mechanics signal");
    }

    if (/prediction|opinion|rumor|chatgpt|influencer|hype|moon|crash|could|might/.test(text)) {
      noise_score += 3;
      reasons.push("Speculative/noisy framing");
    }

    if (/twitter|x\.com|social|community|event/.test(text)) {
      noise_score += 2;
      reasons.push("Social/event chatter");
    }

    return {
      ...r,
      signal_score,
      noise_score,
      net_signal_score: signal_score - noise_score,
      signal_reasons: reasons
    };
  }).sort((a: any, b: any) => b.net_signal_score - a.net_signal_score);
}

export function extractResearchSignals(sourceJson: any) {
  const results = sourceJson?.result?.search?.results || [];

  return results.slice(0, 8).map((r: any) => {
    const text = `${r.title || ""} ${r.snippet || ""}`;

    const prices = text.match(/\$[0-9]+(?:\.[0-9]+)?/g) || [];
    const percentages = text.match(/[0-9]+(?:\.[0-9]+)?%/g) || [];
    const volumes = text.match(/\$?[0-9]+(?:\.[0-9]+)?\s?(?:B|M|billion|million)/g) || [];

    const entities = Array.from(
      new Set(
        (text.match(/\bXRP\b|\bRipple\b|\bSEC\b|\bETF\b|\bCLARITY Act\b|\bCoinMarketCap\b|\bYahoo Finance\b/gi) || [])
          .map((x) => x.trim())
      )
    );

    return {
      title: r.title || "",
      url: r.url || "",
      source: r.source || "",
      snippet: r.snippet || "",
      credibility_score: r.credibility_score ?? 0,
      extracted: {
        prices,
        percentages,
        volumes,
        entities
      }
    };
  });
}

export function buildSignalBrief(sourceJson: any) {
  const signals = extractResearchSignals(sourceJson);

  return {
    signal_version: "v1",
    instruction: "Use only these extracted source signals. Do not invent dates, prices, events, or conclusions not supported by the signals.",
    signals
  };
}


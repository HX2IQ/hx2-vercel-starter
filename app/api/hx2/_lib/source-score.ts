export function scoreSourceCredibility(item: any) {
  const url = String(item.url || "").toLowerCase();

  let score = 0;

  // Tier 1 (high trust)
  if (/yahoo\.com|reuters\.com|bloomberg\.com|cnbc\.com/.test(url)) score += 5;

  // Tier 2 (market data)
  if (/coinmarketcap\.com|coindesk\.com|cointelegraph\.com/.test(url)) score += 4;

  // Tier 3 (aggregators / mixed quality)
  if (/newsnow\.com|binance\.com/.test(url)) score += 2;

  // Low signal / social
  if (/twitter\.com|x\.com/.test(url)) score -= 2;

  return {
    ...item,
    credibility_score: score
  };
}

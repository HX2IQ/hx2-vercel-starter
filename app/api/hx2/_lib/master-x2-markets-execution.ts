import { getNodeRetrievalAnswer } from "./master-retrieval-synthesis";

type NodeExecutionContext = {
  input: string;
  decision: any;
  execution: any;
  retrieval?: any;
};

function nodeFooter(nodeName: string) {
  return `\n\n---\nOptimized by ${nodeName}`;
}
function detectCryptoSymbol(input: string) {
  const q = input.toLowerCase();

  if (q.includes("xrp") || q.includes("ripple")) return "XRP";
  if (q.includes("bitcoin") || q.includes("btc")) return "BTC";
  if (q.includes("ethereum") || q.includes("eth")) return "ETH";
  if (q.includes("xlm") || q.includes("stellar")) return "XLM";
  if (q.includes("hbar") || q.includes("hedera")) return "HBAR";
  if (q.includes("ada") || q.includes("cardano")) return "ADA";

  return "";
}

async function getCryptoSpot(symbol: string) {
  try {
    const res = await fetch(
      `https://api.coinbase.com/v2/prices/${symbol}-USD/spot`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const amount = Number(json?.data?.amount);

    if (!Number.isFinite(amount)) return null;

    return amount;
  } catch {
    return null;
  }
}

export async function executeX2(ctx: NodeExecutionContext): Promise<string> {
  const retrievalAnswer =
    getNodeRetrievalAnswer(ctx, "X2 Markets Intelligence");

  if (retrievalAnswer) {
    return retrievalAnswer;
  }

  const q = ctx.input;
  const symbol = detectCryptoSymbol(q);
  const wantsPrice = /price|current|now|today|trading|worth/i.test(q);
  const wantsForecast = /increase|go up|soon|forecast|prediction|outlook|expected/i.test(q);
  const wantsNews = /news|latest|recent|today|headline|headlines|update|updates|happened/i.test(q);

  if (wantsNews) {
    const retrievalAnswer =
      getNodeRetrievalAnswer(ctx, "X2 Markets Intelligence");

    if (retrievalAnswer) {
      return retrievalAnswer;
    }

    return `I checked live X2 retrieval, but the current XRP results available from connected sources were mostly low-quality aggregator, price, or quote pages. I am not going to present those as reliable news. The next upgrade should add stronger primary-source and Tier 1/Tier 2 crypto-news fallback for this asset.${nodeFooter("X2 Markets Intelligence")}`;
  }

  if (symbol && wantsPrice) {
    const spot = await getCryptoSpot(symbol);

    if (spot !== null) {
      const price = spot.toLocaleString("en-US", {
        minimumFractionDigits: spot < 1 ? 4 : 2,
        maximumFractionDigits: spot < 1 ? 6 : 2
      });

      if (wantsForecast) {
        return `${symbol} is currently about $${price} USD.\n\nShort-term direction is uncertain without live news, volume, liquidity, and broader market confirmation. My safer read is: price retrieval is active, but the next upgrade should add market/news retrieval before Opti gives a stronger probability-weighted forecast.${nodeFooter("X2 Markets Intelligence")}`;
      }

      return `${symbol} is currently about $${price} USD.${nodeFooter("X2 Markets Intelligence")}`;
    }

    return `I identified this as a ${symbol} market question, but the live price source did not return a usable result. A secondary market-data provider should be added next.${nodeFooter("X2 Markets Intelligence")}`;
  }

  return `X2 Markets Intelligence is active. I can help with crypto prices, market structure, catalysts, risk, sentiment, and probability-weighted scenarios.${nodeFooter("X2 Markets Intelligence")}`;
}


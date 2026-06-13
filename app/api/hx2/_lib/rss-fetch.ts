import Parser from "rss-parser";
import { getCachedRss, setCachedRss } from "./rss-cache";
import { scoreRssItems } from "./rss-score";

const parser = new Parser();

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function googleNewsFeed(query: string) {
  const q = encodeURIComponent(query || "crypto");
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
}

function buildFeeds(query: string) {
  const q = String(query || "").trim();

  return uniqueStrings([
    "https://cointelegraph.com/rss",
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    googleNewsFeed("crypto"),
    q ? googleNewsFeed(q) : "",
    /xrp|ripple|xrpl/i.test(q) ? googleNewsFeed("XRP Ripple XRPL") : "",
    /xrp|ripple|xrpl/i.test(q) ? googleNewsFeed("Ripple XRP official announcement") : "",
    /bitcoin|btc/i.test(q) ? googleNewsFeed("Bitcoin BTC market") : "",
    /dtcc/i.test(q) ? googleNewsFeed("DTCC digital assets") : ""
  ]);
}

export async function fetchRssFeeds(query = "") {
  const cached = getCachedRss(query);
  if (cached) return cached;

  try {
    const feeds = buildFeeds(query);
    const results: any[] = [];

    for (const url of feeds) {
      try {
        const feed = await parser.parseURL(url);

        results.push(
          ...feed.items.slice(0, 8).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: url
          }))
        );
      } catch {}
    }

    const finalResults = scoreRssItems(results, query).slice(0, 12);

    setCachedRss(query, finalResults);

    return finalResults;
  } catch {
    return [];
  }
}

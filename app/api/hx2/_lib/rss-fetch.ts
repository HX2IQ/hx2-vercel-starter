import Parser from "rss-parser";
import { getCachedRss, setCachedRss } from "./rss-cache";
import { scoreRssItems } from "./rss-score";

const parser = new Parser();

export async function fetchRssFeeds(query = "") {
  const cached = getCachedRss();
  if (cached) return cached;
  try {
    const feeds = [
      "https://cointelegraph.com/rss",
      "https://www.coindesk.com/arc/outboundfeeds/rss/",
      "https://news.google.com/rss/search?q=crypto&hl=en-US&gl=US&ceid=US:en"
    ];

    const results: any[] = [];

    for (const url of feeds) {
      try {
        const feed = await parser.parseURL(url);
        results.push(
          ...feed.items.slice(0, 5).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: url
          }))
        );
      } catch {}
    }

    const finalResults = scoreRssItems(results, query).slice(0, 10);
  setCachedRss(finalResults);
  return finalResults;
  } catch {
    return [];
  }
}



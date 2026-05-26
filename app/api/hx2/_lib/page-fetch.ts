export function cleanText(s: unknown): string {
  return String(s || "").replace(/\s+/g, " ").trim();
}

export async function fetchChosenPageText(url: string): Promise<string> {
  const u = cleanText(url);
  if (!u) return "";

  try {
    const res = await fetch(u, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 HX2/1.0",
        "Accept": "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    const html = await res.text();

    return String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

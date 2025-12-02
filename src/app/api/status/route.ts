import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const acceptHeader = req.headers.get("accept") || "";

  const baseUrl =
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_ENV === "production"
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const safeFetch = async (path: string) => {
    const fullUrl = `${baseUrl}${path}`;
    try {
      const res = await fetch(fullUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`${path} → ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return { error: true, message: err.message };
    }
  };

  const [health, metrics, db, drive, openai] = await Promise.all([
    safeFetch("/api/health"),
    safeFetch("/api/metrics"),
    safeFetch("/api/health/db"),
    safeFetch("/api/health/drive"),
    safeFetch("/api/health/openai"),
  ]);

  const allOk =
    [health, db, drive, openai].every((s: any) => !s.error && s.status === "ok") &&
    !metrics.error;
  const overallStatus = allOk ? "ok" : "issues";

  // ✅ If client asks for JSON → return structured object
  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({
      status: overallStatus,
      health: {
        core: health.status || "unreachable",
        db: db.status || "unreachable",
        drive: drive.status || "unreachable",
        openai: openai.status || "unreachable",
      },
      metrics: metrics.error ? null : metrics,
      timestamp: new Date().toISOString(),
      source: baseUrl,
    });
  }

  // ✅ Otherwise, serve HTML for human-readable dashboard
  const getColor = (status: string) => {
    if (status === "ok") return "🟢";
    if (status === "warn") return "🟡";
    return "🔴";
  };

  const html = `
  <html style="font-family:sans-serif;background:#0a0a12;color:white;padding:20px;line-height:1.6">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="refresh" content="30">
      <title>HX2 System Status</title>
      <style>
        body { max-width: 720px; margin:auto; }
        ul { list-style:none; padding:0; }
        li { margin:6px 0; }
        .timestamp { color:#888; font-size:13px; }
        .status-box { padding:12px; border:1px solid #333; border-radius:8px; background:#111; margin-top:10px; }
        .ok { color:#22c55e; }
        .warn { color:#eab308; }
        .down { color:#f87171; }
      </style>
    </head>
    <body>
      <h2>HX2 System Status</h2>
      <p><b>Overall:</b> ${allOk ? "🟢 OK" : "🔴 Issues detected"}</p>
      <p class="timestamp">Last updated: ${new Date().toLocaleString()} (auto-refresh every 30s)</p>

      <div class="status-box">
        <h3>Health</h3>
        <ul>
          <li>${getColor(health.status || "down")} Core: ${health.status || "unreachable"}</li>
          <li>${getColor(db.status || "down")} DB: ${db.status || "unreachable"}</li>
          <li>${getColor(drive.status || "down")} Drive: ${drive.status || "unreachable"}</li>
          <li>${getColor(openai.status || "down")} OpenAI: ${openai.status || "unreachable"}</li>
        </ul>
      </div>

      <div class="status-box">
        <h3>Metrics</h3>
        ${
          metrics.error
            ? `<p class="down">❌ Metrics unavailable</p>`
            : `<ul>
                <li>Uptime: ${(metrics.uptimeSec / 3600).toFixed(2)} hrs</li>
                <li>Error Rate (1h): ${(metrics.errorRate1h * 100).toFixed(2)}%</li>
                <li>P95 Latency: ${metrics.p95LatencyMs} ms</li>
                <li>Queue Depth: ${metrics.queueDepth}</li>
              </ul>`
        }
      </div>

      <p class="timestamp">Build ID: ${health.buildId || "n/a"}<br>Source: ${baseUrl}</p>
    </body>
  </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

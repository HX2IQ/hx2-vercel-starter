const base = process.env.OI_BASE_URL || "https://optinodeiq.com";

async function must(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function main() {
  // 1) UI smoke (HTML)
  {
    const url = `${base}/oi/h2?ts=${Date.now()}`;
    const res = await fetch(url, { method: "GET" });
    await must(res.ok, `UI HTTP ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    await must(ct.includes("text/html"), `UI content-type unexpected: ${ct}`);
  }

  // 2) API contract smoke (JSON)
  {
    const url = `${base}/api/h2/run?ts=${Date.now()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "SAFE", query: "status" }),
    });
    await must(res.ok, `API HTTP ${res.status}`);
    const j = await res.json();

    await must(j.ok === true, "ok !== true");
    await must(typeof j.service === "string", "missing service");
    await must(j.result?.output, "missing result.output");
    await must(typeof j.result.output.regime === "string", "missing output.regime");
    await must(typeof j.result.output.summary === "string", "missing output.summary");
    await must(Array.isArray(j.result.output.signals), "missing output.signals[]");
  }

  console.log("H2 UI+API smoke: PASS");
}

main().catch((e) => {
  console.error("H2 UI+API smoke: FAIL");
  console.error(e?.stack || e);
  process.exit(1);
});

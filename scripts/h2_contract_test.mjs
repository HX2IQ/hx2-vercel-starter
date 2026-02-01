const base = process.env.OI_BASE_URL || "https://optinodeiq.com";

async function main() {
  const url = `${base}/api/h2/run?ts=${Date.now()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "SAFE", query: "echo:contract_test" }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();

  // Minimal contract expectations
  if (j.ok !== true) throw new Error("ok !== true");
  if (!j.result?.output) throw new Error("missing result.output");
  if (typeof j.result.output.regime !== "string") throw new Error("missing output.regime");
  if (typeof j.result.output.summary !== "string") throw new Error("missing output.summary");
  if (!Array.isArray(j.result.output.signals)) throw new Error("missing output.signals[]");

  console.log("H2 contract test: PASS");
  console.log(`regime=${j.result.output.regime}`);
}

main().catch((e) => {
  console.error("H2 contract test: FAIL");
  console.error(e?.stack || e);
  process.exit(1);
});

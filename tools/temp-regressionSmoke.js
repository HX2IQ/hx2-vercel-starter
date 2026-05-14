const fetchFn = global.fetch || require("node-fetch");

function authHeaders() {
  const key = String(process.env.HX2_API_KEY || "").trim();
  return key
    ? {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key.startsWith("Bearer ") ? key.slice(7).trim() : key}`,
      }
    : { "Content-Type": "application/json" };
}

async function postJson(url, body, timeoutMs = 120000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    });

    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    return {
      ok: res.ok,
      status: res.status,
      data: json ?? text,
    };
  } finally {
    clearTimeout(t);
  }
}

function addResult(results, test, pass, detail) {
  results.push({
    test,
    status: pass ? "PASS" : "FAIL",
    detail,
  });
}

function hasText(v, needle) {
  return String(v || "").toLowerCase().includes(String(needle || "").toLowerCase());
}

function getReply(data) {
  return String(
    data?.result?.data?.reply ||
    data?.result?.reply ||
    data?.reply ||
    ""
  );
}

module.exports = async function regressionSmoke(task) {
  const payload = (task && task.payload && typeof task.payload === "object") ? task.payload : {};
  const base = String(payload.base || process.env.OI_BASE_URL || "https://optinodeiq.com").replace(/\/+$/, "");

  const results = [];

  try {
    const res = await fetchFn(`${base}/api/brain/status`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    addResult(results, "brain/status http", res.status === 200, `HTTP ${res.status}`);
    addResult(results, "brain/status ok", !!json?.ok, `ok=${json?.ok}`);
  } catch (e) {
    addResult(results, "brain/status request", false, e?.message || String(e));
  }

  try {
    const x2 = await postJson(`${base}/api/chat/send`, {
      message: "What does the latest macro intelligence imply for XRP and broader markets?",
      node_target: "X2"
    });

    addResult(results, "X2 http", x2.status === 200, `HTTP ${x2.status}`);
    addResult(results, "X2 ok", !!x2.data?.ok, `ok=${x2.data?.ok}`);
    addResult(results, "X2 node target", x2.data?.node_target === "X2", `node_target=${x2.data?.node_target}`);
    addResult(results, "X2 anchor", x2.data?.anchor_source === "bloomberg_markets", `anchor=${x2.data?.anchor_source}`);

    const reply = getReply(x2.data);
    addResult(results, "X2 reply present", reply.length > 0, `reply_length=${reply.length}`);
    addResult(results, "X2 brief has Brief Title", hasText(reply, "Brief Title"), "Checked reply for Brief Title");
    addResult(results, "X2 brief has Primary Signal", hasText(reply, "Primary Signal"), "Checked reply for Primary Signal");
    addResult(results, "X2 brief has Supporting Context", hasText(reply, "Supporting Context"), "Checked reply for Supporting Context");
    addResult(results, "X2 brief has Implications", hasText(reply, "Implications"), "Checked reply for Implications");
    addResult(results, "X2 brief has Confidence", hasText(reply, "Confidence"), "Checked reply for Confidence");
    addResult(results, "X2 brief has Monitoring Priorities", hasText(reply, "Monitoring Priorities"), "Checked reply for Monitoring Priorities");
    addResult(results, "X2 no-direct wording", hasText(reply, "no clear direct catalyst") || hasText(reply, "no direct catalyst"), "Checked reply for no-direct wording");
    addResult(results, "X2 indirect backdrop wording", hasText(reply, "indirect backdrop"), "Checked reply for indirect backdrop wording");
    addResult(results, "X2 narrative support wording", hasText(reply, "narrative support"), "Checked reply for narrative support wording");
  } catch (e) {
    addResult(results, "X2 request", false, e?.message || String(e));
  }

  try {
    const h2 = await postJson(`${base}/api/chat/send`, {
      message: "What are the biggest geopolitical signals in the latest intelligence?",
      node_target: "H2"
    });

    addResult(results, "H2 http", h2.status === 200, `HTTP ${h2.status}`);
    addResult(results, "H2 ok", !!h2.data?.ok, `ok=${h2.data?.ok}`);
    addResult(results, "H2 node target", h2.data?.node_target === "H2", `node_target=${h2.data?.node_target}`);
    addResult(results, "H2 anchor", h2.data?.anchor_source === "bbc_world", `anchor=${h2.data?.anchor_source}`);

    const directCount = Array.isArray(h2.data?.catalyst_summary?.direct_catalysts)
      ? h2.data.catalyst_summary.direct_catalysts.length
      : 0;
    addResult(results, "H2 direct catalyst count", directCount >= 1, `direct_count=${directCount}`);

    const reply = getReply(h2.data);
    addResult(results, "H2 reply present", reply.length > 0, `reply_length=${reply.length}`);
    addResult(results, "H2 brief has Brief Title", hasText(reply, "Brief Title"), "Checked reply for Brief Title");
    addResult(results, "H2 brief has Primary Signal", hasText(reply, "Primary Signal"), "Checked reply for Primary Signal");
    addResult(results, "H2 brief has Supporting Context", hasText(reply, "Supporting Context"), "Checked reply for Supporting Context");
    addResult(results, "H2 brief has Implications", hasText(reply, "Implications"), "Checked reply for Implications");
    addResult(results, "H2 brief has Confidence", hasText(reply, "Confidence"), "Checked reply for Confidence");
    addResult(results, "H2 brief has Monitoring Priorities", hasText(reply, "Monitoring Priorities"), "Checked reply for Monitoring Priorities");
    addResult(results, "H2 direct-catalyst wording", hasText(reply, "direct catalyst"), "Checked reply for direct-catalyst wording");
    addResult(results, "H2 narrative-support wording", hasText(reply, "narrative support"), "Checked reply for narrative-support wording");
  } catch (e) {
    addResult(results, "H2 request", false, e?.message || String(e));
  }

  try {
    const h2Cross = await postJson(`${base}/api/chat/send`, {
      message: "Do the latest intelligence signals suggest these Iran and Taiwan developments are connected as part of a broader escalation pattern, or should they still be treated as separate theaters?",
      node_target: "H2"
    });

    addResult(results, "H2 cross http", h2Cross.status === 200, `HTTP ${h2Cross.status}`);
    addResult(results, "H2 cross anchor", h2Cross.data?.anchor_source === "bbc_world", `anchor=${h2Cross.data?.anchor_source}`);

    const reply = getReply(h2Cross.data);
    const hasRestraint =
      hasText(reply, "separate") ||
      hasText(reply, "distinct") ||
      hasText(reply, "indirectly") ||
      hasText(reply, "do not attribute direct causality") ||
      hasText(reply, "do not attribute direct causality or spillover");

    addResult(results, "H2 cross reply present", reply.length > 0, `reply_length=${reply.length}`);
    addResult(results, "H2 cross restraint wording", hasRestraint, "Checked reply for separation/restraint wording");
    addResult(results, "H2 cross direct-catalyst wording", hasText(reply, "direct catalyst"), "Checked reply for direct-catalyst wording");
    addResult(results, "H2 cross narrative-support wording", hasText(reply, "narrative support"), "Checked reply for narrative-support wording");
  } catch (e) {
    addResult(results, "H2 cross request", false, e?.message || String(e));
  }

  const fails = results.filter(x => x.status === "FAIL");

  return {
    ok: fails.length === 0,
    handler: "regressionSmoke",
    base,
    fail_count: fails.length,
    pass_count: results.filter(x => x.status === "PASS").length,
    results,
  };
};

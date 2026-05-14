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
      headers: Object.fromEntries(res.headers.entries()),
      data: json ?? text,
    };
  } finally {
    clearTimeout(t);
  }
}

module.exports = async function regressionSmoke(task) {
  const payload = (task && task.payload && typeof task.payload === "object") ? task.payload : {};
  const base = String(payload.base || process.env.OI_BASE_URL || "https://optinodeiq.com").replace(/\/+$/, "");

  const x2 = await postJson(`${base}/api/chat/send`, {
    message: "What does the latest macro intelligence imply for XRP and broader markets?",
    node_target: "X2"
  });

  const h2 = await postJson(`${base}/api/chat/send`, {
    message: "What are the biggest geopolitical signals in the latest intelligence?",
    node_target: "H2"
  });

  const h2Cross = await postJson(`${base}/api/chat/send`, {
    message: "Do the latest intelligence signals suggest these Iran and Taiwan developments are connected as part of a broader escalation pattern, or should they still be treated as separate theaters?",
    node_target: "H2"
  });

  return {
    ok: true,
    handler: "regressionSmoke",
    base,
    debug: {
      x2,
      h2,
      h2Cross
    }
  };
};

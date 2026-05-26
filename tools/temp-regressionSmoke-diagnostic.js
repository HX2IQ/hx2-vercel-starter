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

async function getJson(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchFn(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
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

function getReply(data) {
  return String(
    data?.result?.data?.reply ||
    data?.result?.reply ||
    data?.reply ||
    ""
  );
}

function classifyChatResult(label, resp) {
  const out = {
    label,
    http_status: resp?.status ?? null,
    ok: !!resp?.ok,
    node_target: resp?.data?.node_target ?? null,
    selected_intel_count: resp?.data?.selected_intel_count ?? null,
    anchor_source: resp?.data?.anchor_source ?? null,
    reply_length: getReply(resp?.data).length,
    classification: "unknown",
    reason: null,
  };

  if (!resp) {
    out.classification = "fail_request";
    out.reason = "No response object";
    return out;
  }

  if (resp.status === 504 || resp?.data?.error === "Timed out waiting for brain.chat") {
    out.classification = "warn_timeout";
    out.reason = resp?.data?.error || `HTTP ${resp.status}`;
    return out;
  }

  if (resp.status >= 500) {
    out.classification = "fail_request";
    out.reason = resp?.data?.error || `HTTP ${resp.status}`;
    return out;
  }

  if (resp?.data?.result?.guarded_no_recent_intelligence) {
    out.classification = "warn_guarded_no_recent_intelligence";
    out.reason = "No recent intelligence selected";
    return out;
  }

  if (resp.ok && resp?.data?.ok) {
    out.classification = "pass";
    out.reason = "Valid response payload received";
    return out;
  }

  out.classification = "warn_unexpected_shape";
  out.reason = "Response returned but shape was not the expected live-intel success shape";
  return out;
}

module.exports = async function regressionSmoke(task) {
  const payload = (task && task.payload && typeof task.payload === "object") ? task.payload : {};
  const base = String(payload.base || process.env.OI_BASE_URL || "https://optinodeiq.com").replace(/\/+$/, "");

  const brain = await getJson(`${base}/api/brain/status`, 30000).catch((e) => ({
    ok: false,
    status: null,
    data: { error: e?.message || String(e) }
  }));

  const x2 = await postJson(`${base}/api/chat/send`, {
    message: "What does the latest macro intelligence imply for XRP and broader markets?",
    node_target: "X2"
  }, 120000).catch((e) => ({
    ok: false,
    status: null,
    data: { error: e?.message || String(e) }
  }));

  const h2 = await postJson(`${base}/api/chat/send`, {
    message: "What are the biggest geopolitical signals in the latest intelligence?",
    node_target: "H2"
  }, 120000).catch((e) => ({
    ok: false,
    status: null,
    data: { error: e?.message || String(e) }
  }));

  const h2Cross = await postJson(`${base}/api/chat/send`, {
    message: "Do the latest intelligence signals suggest these Iran and Taiwan developments are connected as part of a broader escalation pattern, or should they still be treated as separate theaters?",
    node_target: "H2"
  }, 120000).catch((e) => ({
    ok: false,
    status: null,
    data: { error: e?.message || String(e) }
  }));

  const summary = {
    brain_status: brain?.ok && brain?.status === 200 && brain?.data?.ok ? "reachable" : "unreachable",
    x2_status: classifyChatResult("X2", x2),
    h2_status: classifyChatResult("H2", h2),
    h2_cross_status: classifyChatResult("H2 cross", h2Cross),
  };

  const hardFailures = [
    summary.brain_status !== "reachable",
    summary.x2_status.classification === "fail_request",
    summary.h2_status.classification === "fail_request",
    summary.h2_cross_status.classification === "fail_request",
  ].filter(Boolean).length;

  return {
    ok: hardFailures === 0,
    handler: "regressionSmoke",
    mode: "diagnostic",
    base,
    hard_failure_count: hardFailures,
    summary,
    debug: {
      brain,
      x2,
      h2,
      h2Cross
    }
  };
};

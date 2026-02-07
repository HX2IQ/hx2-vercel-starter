const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_openai_harden_${stamp}`;
fs.copyFileSync(file, backup);

// anchor to function start
const anchor = "async function callOpenAIChat";
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: callOpenAIChat not found");
  process.exit(1);
}

// find statement start (line start)
let start = s.lastIndexOf("\n", idx);
start = start === -1 ? 0 : start + 1;

// find end of function by brace counting from first "{"
const openBrace = s.indexOf("{", idx);
if (openBrace === -1) {
  console.log("PATCH_FAIL: cannot find opening brace");
  process.exit(1);
}

let i = openBrace, depth = 0;
let inStr = false, strCh = "", esc = false;

for (; i < s.length; i++) {
  const ch = s[i];

  if (inStr) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === strCh) { inStr = false; strCh = ""; }
    continue;
  }

  if (ch === '"' || ch === "'" || ch === "`") { inStr = true; strCh = ch; continue; }
  if (ch === "{") depth++;
  if (ch === "}") depth--;

  if (depth === 0 && i > openBrace) {
    i = i + 1; // include closing }
    break;
  }
}

const end = i;

const newFn = `
async function callOpenAIChat(messages) {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model  = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) return { ok: false, status: 500, error: "missing_openai_key" };

  const payload = {
    model,
    messages: Array.isArray(messages) ? messages : [],
    temperature: 0.2
  };

  let resp, text, data;
  try {
    resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    return { ok: false, status: 502, error: "openai_fetch_failed", details: String(e && e.message ? e.message : e) };
  }

  try {
    text = await resp.text();
  } catch (e) {
    return { ok: false, status: 502, error: "openai_read_failed" };
  }

  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    return { ok: false, status: resp.status || 502, error: "openai_bad_json", details: (text || "").slice(0, 400) };
  }

  if (!resp.ok) {
    return {
      ok: false,
      status: resp.status || 502,
      error: "openai_http_" + String(resp.status || "unknown"),
      details: data && data.error ? data.error : data
    };
  }

  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    null;

  if (typeof content !== "string" || !content.trim()) {
    return { ok: false, status: 502, error: "openai_no_content", details: data };
  }

  return { ok: true, text: content.trim() };
}
`;

s = s.slice(0, start) + newFn + "\n" + s.slice(end);
fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

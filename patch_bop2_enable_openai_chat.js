const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_bop2_enable_openai_${stamp}`;
fs.copyFileSync(file, backup);

function fail(msg) { console.log("PATCH_FAIL:", msg); process.exit(1); }

// --- 1) inject helpers after extractMsg() return line (only if missing)
if (!s.includes("function extractMessages(") || !s.includes("async function callOpenAIChat(")) {
  const anchor = 'return String(msg || "").trim();';
  const idx = s.indexOf(anchor);
  if (idx === -1) fail("extractMsg anchor not found");

  const endLine = s.indexOf("\n", idx);
  if (endLine === -1) fail("cannot find end of anchor line");

  const injection = `

function extractMessages(body) {
  const _body = body || {};
  const _in = _body.input || _body || {};
  if (Array.isArray(_in.messages)) {
    return _in.messages
      .filter(m => m && typeof m.role === "string")
      .map(m => {
        if (typeof m.content === "string") return { role: m.role, content: m.content };
        if (Array.isArray(m.content)) {
          const part = m.content.find(x => x && x.type === "text" && typeof x.text === "string");
          return { role: m.role, content: part ? part.text : "" };
        }
        return { role: m.role, content: "" };
      })
      .filter(m => (m.content || "").trim().length > 0);
  }
  const msg = extractMsg(_body);
  return msg ? [{ role: "user", content: msg }] : [];
}

async function callOpenAIChat(messages) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const model  = String(process.env.OPENAI_MODEL || "gpt-4o-mini").trim();

  if (!apiKey) return { ok: false, error: "OPENAI_API_KEY missing" };

  const payload = {
    model,
    messages: [
      { role: "system", content: "You are Opti, an AI assistant. Be helpful, clear, and concise." },
      ...messages
    ],
    temperature: 0.2
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + apiKey },
    body: JSON.stringify(payload)
  });

  const j = await r.json().catch(() => null);
  if (!r.ok) return { ok: false, error: "openai_error", status: r.status, details: j };

  const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "empty_model_reply", details: j };

  return { ok: true, text };
}
`;

  s = s.slice(0, endLine + 1) + injection + s.slice(endLine + 1);
}

// --- 2) replace /brain/chat handler via brace-counting (robust)
const anchorChat = 'app.post("/brain/chat"';
const idxChat = s.indexOf(anchorChat);
if (idxChat === -1) fail("chat anchor not found: " + anchorChat);

// start of statement
let start = s.lastIndexOf("\n", idxChat);
start = start === -1 ? 0 : start + 1;

// find opening brace for handler
const openBrace = s.indexOf("{", idxChat);
if (openBrace === -1) fail("cannot find opening brace for /brain/chat");

let i = openBrace;
let depth = 0;
let inStr = false;
let strCh = "";
let esc = false;

for (; i < s.length; i++) {
  const ch = s[i];

  if (inStr) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === strCh) { inStr = false; strCh = ""; }
    continue;
  } else {
    if (ch === '"' || ch === "'" || ch === "`") { inStr = true; strCh = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0 && i > openBrace) {
      const tail = s.indexOf(");", i);
      if (tail === -1) fail("cannot find closing ); for /brain/chat");
      i = tail + 2;
      break;
    }
  }
}
const end = i;

const newHandler = `
app.post("/brain/chat", async (req, res) => {
  const st = status();

  if (!st.brain_attached) {
    const msg = extractMsg(req.body);
    return res.json({
      ok: true,
      reply: msg ? \`Echo: \${msg}\` : "Echo: (empty message)",
      brain_attached: st.brain_attached,
      brain_version: st.brain_version || null,
      mode: st.mode,
      timestamp: nowIso()
    });
  }

  try {
    const msgs = extractMessages(req.body);
    const out  = await callOpenAIChat(msgs);

    if (!out.ok) {
      return res.status(502).json({
        ok: false,
        error: out.error || "openai_failed",
        status: out.status || 502,
        details: out.details || null
      });
    }

    return res.json({
      ok: true,
      reply: out.text,
      brain_attached: st.brain_attached,
      brain_version: st.brain_version || null,
      mode: st.mode,
      timestamp: nowIso()
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "brain_chat_exception" });
  }
});
`;

s = s.slice(0, start) + newHandler + "\n" + s.slice(end);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

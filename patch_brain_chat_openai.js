const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_openai_${stamp}`;
fs.copyFileSync(file, backup);

let changed = false;

// Insert helpers once
if (!s.includes("async function callOpenAIChat")) {
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

  const text = j?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "empty_model_reply", details: j };

  return { ok: true, text };
}
`;

  const anchor = "return String(msg || \"\").trim();";
  const idx = s.indexOf(anchor);
  if (idx === -1) {
    console.log("PATCH_FAIL: extractMsg anchor not found");
    process.exit(1);
  }
  const endLine = s.indexOf("\n", idx);
  s = s.slice(0, endLine + 1) + injection + s.slice(endLine + 1);
  changed = true;
}

// Replace /brain/chat handler
const reChat = /app\.post\(\"\/brain\/chat\",\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);\s*/m;
if (!reChat.test(s)) {
  console.log("PATCH_FAIL: /brain/chat handler not matched");
  process.exit(1);
}

const newHandler = `app.post("/brain/chat", async (req, res) => {
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
    const out = await callOpenAIChat(msgs);

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
  } catch (_e) {
    return res.status(500).json({ ok: false, error: "brain_chat_exception" });
  }
});
`;

s = s.replace(reChat, newHandler + "\n");
changed = true;

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

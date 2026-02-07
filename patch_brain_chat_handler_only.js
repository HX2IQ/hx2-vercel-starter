const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_chat_handler_${stamp}`;
fs.copyFileSync(file, backup);

// Match async handler, either " or '
const re1 = /app\.post\(\s*"\/brain\/chat"\s*,\s*async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*\{[\s\S]*?\}\s*\)\s*;\s*/m;
const re2 = /app\.post\(\s*'\/brain\/chat'\s*,\s*async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*\{[\s\S]*?\}\s*\)\s*;\s*/m;

let matched = false;
if (re1.test(s)) { s = s.replace(re1, "__REPLACE__"); matched = true; }
else if (re2.test(s)) { s = s.replace(re2, "__REPLACE__"); matched = true; }

if (!matched) {
  console.log("PATCH_FAIL: async /brain/chat handler not found");
  process.exit(1);
}

const newHandler = `app.post("/brain/chat", async (req, res) => {
  const st = status();

  // If not attached, keep legacy echo behavior
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
    const msgs = (typeof extractMessages === "function") ? extractMessages(req.body) : [];
    const out  = (typeof callOpenAIChat === "function") ? await callOpenAIChat(msgs) : { ok: false, error: "callOpenAIChat missing" };

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
});`;

s = s.replace("__REPLACE__", newHandler + "\n");

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

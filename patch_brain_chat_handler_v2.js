const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_chat_v2_${stamp}`;
fs.copyFileSync(file, backup);

function findHandlerRange(src) {
  const needles = ['app.post("/brain/chat"', "app.post('/brain/chat'"];
  let start = -1;
  for (const n of needles) {
    start = src.indexOf(n);
    if (start !== -1) break;
  }
  if (start === -1) return null;

  // Find the opening paren of app.post(
  let i = src.indexOf("(", start);
  if (i === -1) return null;

  // Walk until matching ')' for the app.post(...) call, ignoring strings/comments.
  let depth = 0;
  let inS = false, inD = false, inT = false, inLineC = false, inBlockC = false, esc = false;

  for (; i < src.length; i++) {
    const c = src[i], n = src[i + 1];

    if (inLineC) { if (c === "\n") inLineC = false; continue; }
    if (inBlockC) { if (c === "*" && n === "/") { inBlockC = false; i++; } continue; }

    if (inS) { if (!esc && c === "'") inS = false; esc = (!esc && c === "\\"); continue; }
    if (inD) { if (!esc && c === '"') inD = false; esc = (!esc && c === "\\"); continue; }
    if (inT) { if (!esc && c === "`") inT = false; esc = (!esc && c === "\\"); continue; }

    if (c === "/" && n === "/") { inLineC = true; i++; continue; }
    if (c === "/" && n === "*") { inBlockC = true; i++; continue; }

    if (c === "'") { inS = true; esc = false; continue; }
    if (c === '"') { inD = true; esc = false; continue; }
    if (c === "`") { inT = true; esc = false; continue; }

    if (c === "(") depth++;
    if (c === ")") {
      depth--;
      if (depth === 0) {
        // include trailing semicolon if present
        let end = i + 1;
        while (end < src.length && /\s/.test(src[end])) end++;
        if (src[end] === ";") end++;
        return { start, end };
      }
    }
  }
  return null;
}

const range = findHandlerRange(s);
if (!range) {
  console.log("PATCH_FAIL: could not locate app.post('/brain/chat'...) range");
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

s = s.slice(0, range.start) + newHandler + "\n\n" + s.slice(range.end);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, replaced: [range.start, range.end] });

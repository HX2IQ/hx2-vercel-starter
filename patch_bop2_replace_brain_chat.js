const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_chat_${stamp}`;
fs.copyFileSync(file, backup);

const anchor = 'app.post("/brain/chat"';
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: anchor not found:", anchor);
  process.exit(1);
}

// Find start of handler statement (line start)
let start = s.lastIndexOf("\n", idx);
start = start === -1 ? 0 : start + 1;

// Find end of handler by brace counting from first "{"
const openBrace = s.indexOf("{", idx);
if (openBrace === -1) {
  console.log("PATCH_FAIL: cannot find opening brace for handler");
  process.exit(1);
}

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
    // when depth returns to 0, we should be right after handler's closing "}"
    if (depth === 0 && i > openBrace) {
      // find the closing ");" after this point
      const tail = s.indexOf(");", i);
      if (tail === -1) {
        console.log("PATCH_FAIL: cannot find closing ); for handler");
        process.exit(1);
      }
      i = tail + 2;
      break;
    }
  }
}

const end = i; // end index (exclusive)

// New handler (assumes status(), nowIso(), extractMsg(), extractMessages(), callOpenAIChat() already exist)
const newHandler = `
app.post("/brain/chat", async (req, res) => {
  const st = status();

  // Not attached -> legacy echo (helps diagnostics)
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

    if (!out || !out.ok) {
      return res.status(502).json({
        ok: false,
        error: (out && out.error) ? out.error : "openai_failed",
        status: (out && out.status) ? out.status : 502,
        details: (out && out.details) ? out.details : null
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

const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_define_callOpenAIChat_${stamp}`;
fs.copyFileSync(file, backup);

// If already defined anywhere, do nothing
if (/\basync\s+function\s+callOpenAIChat\s*\(/.test(s) || /\bfunction\s+callOpenAIChat\s*\(/.test(s)) {
  console.log("PATCH_SKIP: callOpenAIChat already defined", { file, backup });
  process.exit(0);
}

// Insert before the /brain/chat handler
const anchor = 'app.post("/brain/chat", async (req, res) => {';
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: /brain/chat handler anchor not found");
  process.exit(2);
}

const inject = `
/**
 * --- HOTFIX: define callOpenAIChat at top-level (scope-safe)
 * Infra-only: minimal OpenAI Chat Completions bridge.
 */
async function callOpenAIChat(messages) {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.HX2_OPENAI_API_KEY ||
    process.env.BRAIN_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_missing");
  }

  const model =
    process.env.OPENAI_MODEL ||
    process.env.HX2_OPENAI_MODEL ||
    process.env.BRAIN_MODEL ||
    "gpt-4o-mini";

  const payload = {
    model,
    messages: Array.isArray(messages) ? messages : [],
    temperature: 0.2
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const txt = await r.text();
  let j;
  try { j = JSON.parse(txt); } catch { j = { raw: txt }; }

  if (!r.ok) {
    const msg = (j && j.error && j.error.message) ? j.error.message : ("OpenAI HTTP " + r.status);
    const e = new Error("openai_error: " + msg);
    e.http_status = r.status;
    e.openai = j;
    throw e;
  }

  const content =
    j?.choices?.[0]?.message?.content ??
    j?.choices?.[0]?.message?.text ??
    "";

  return { model, content, raw: j };
}

`;

s = s.slice(0, idx) + inject + s.slice(idx);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, change: "Injected global callOpenAIChat() before /brain/chat" });

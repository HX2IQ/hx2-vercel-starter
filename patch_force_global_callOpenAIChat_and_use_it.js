const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_force_global_callOpenAIChat_${stamp}`;
fs.copyFileSync(file, backup);

const chatMarker = 'app.post("/brain/chat", async (req, res) => {';
const iChat = s.indexOf(chatMarker);
if (iChat === -1) {
  console.log("PATCH_FAIL: /brain/chat marker not found");
  process.exit(2);
}

// 1) Inject a scope-safe global function BEFORE /brain/chat.
// Only inject if we don't already see a globalThis assignment nearby.
const alreadyGlobal = /globalThis\.callOpenAIChat\s*=/.test(s);

if (!alreadyGlobal) {
  const inject = `
/**
 * --- HOTFIX: force scope-safe OpenAI bridge on globalThis
 * NOTE: infra-only, minimal.
 */
async function __callOpenAIChat_global(messages) {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.HX2_OPENAI_API_KEY ||
    process.env.BRAIN_OPENAI_API_KEY;

  if (!apiKey) throw new Error("OPENAI_API_KEY_missing");

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
    const msg = j?.error?.message ? j.error.message : ("OpenAI HTTP " + r.status);
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

// Prefer existing globalThis.callOpenAIChat if present, otherwise set it.
if (typeof globalThis.callOpenAIChat !== "function") {
  globalThis.callOpenAIChat = __callOpenAIChat_global;
}
`;
  s = s.slice(0, iChat) + inject + s.slice(iChat);
}

// 2) Inside /brain/chat handler, replace any direct callOpenAIChat(...) with globalThis.callOpenAIChat(...)
// This avoids ReferenceError due to scope.
let changed = 0;

// Replace "await callOpenAIChat(" patterns
s = s.replace(/await\s+callOpenAIChat\s*\(/g, () => { changed++; return "await globalThis.callOpenAIChat("; });

// Replace "callOpenAIChat(" patterns (non-awaited)
s = s.replace(/([^.\w])callOpenAIChat\s*\(/g, (m, p1) => { changed++; return `${p1}globalThis.callOpenAIChat(`; });

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, injectedGlobal: !alreadyGlobal, replacedCalls: changed });

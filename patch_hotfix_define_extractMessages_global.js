const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_hotfix_extractMessages_global_${stamp}`;
fs.copyFileSync(file, backup);

// If already globally defined in the file, do nothing
if (/\n\s*function\s+extractMessages\s*\(/.test(s)) {
  // Still might be in wrong scope, so we ONLY skip if it's defined before callOpenAIChat
  const idxCall = s.indexOf("async function callOpenAIChat");
  const idxFn   = s.indexOf("function extractMessages");
  if (idxCall !== -1 && idxFn !== -1 && idxFn < idxCall) {
    console.log("PATCH_SKIP: extractMessages already appears before callOpenAIChat", { file, backup });
    process.exit(0);
  }
}

const anchor = "\n  async function callOpenAIChat(messages) {";
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: anchor not found: callOpenAIChat");
  process.exit(2);
}

const inject = `
  // --- HOTFIX: ensure extractMessages is defined at top-level (scope-safe)
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
    // fallback to extractMsg if present
    try {
      if (typeof extractMsg === "function") {
        const msg = extractMsg(_body);
        return msg ? [{ role: "user", content: msg }] : [];
      }
    } catch {}
    return [];
  }

`;

s = s.slice(0, idx) + inject + s.slice(idx);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, change: "Injected top-level extractMessages before callOpenAIChat" });

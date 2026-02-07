const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_add_extractMessages_${stamp}`;
fs.copyFileSync(file, backup);

// If it already exists, no-op
if (s.includes("function extractMessages(")) {
  console.log("PATCH_SKIP: extractMessages already exists", { file, backup });
  process.exit(0);
}

// Insert right after extractMsg(...) function, if present
const anchor = "function extractMsg(";
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: anchor not found:", anchor);
  process.exit(1);
}

// Find end of extractMsg function by brace counting
const openBrace = s.indexOf("{", idx);
if (openBrace === -1) {
  console.log("PATCH_FAIL: cannot find opening brace for extractMsg");
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

const insertAt = i;

const shim = `

function extractMessages(body) {
  const _body = body || {};
  const _in = _body.input || _body || {};

  // If caller passed full messages array already, normalize it
  const msgs = Array.isArray(_in.messages) ? _in.messages : null;
  if (msgs && msgs.length) {
    return msgs.map(m => {
      const role = (m && typeof m.role === "string") ? m.role : "user";
      const content = (m && typeof m.content === "string") ? m.content : JSON.stringify(m?.content ?? "");
      return { role, content };
    });
  }

  // Fallback: accept a single message string
  const msg = (typeof _in.message === "string") ? _in.message
            : (typeof _body.message === "string") ? _body.message
            : "";

  const text = String(msg || "").trim();
  return text ? [{ role: "user", content: text }] : [{ role: "user", content: "(empty message)" }];
}
`;

s = s.slice(0, insertAt) + shim + s.slice(insertAt);
fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_lift_callOpenAIChat_global_v2_${stamp}`;
fs.copyFileSync(file, backup);

// Skip if already lifted
if (/globalThis\.callOpenAIChat\b/.test(s)) {
  console.log("PATCH_SKIP: globalThis.callOpenAIChat already present", { file, backup });
  process.exit(0);
}

// Locate function text
const sig = "async function callOpenAIChat(messages) {";
const iFn = s.indexOf(sig);
if (iFn === -1) {
  console.log("PATCH_FAIL: callOpenAIChat signature not found", { file, backup });
  process.exit(2);
}

// Extract function via brace counting
let i = iFn;
let brace = 0;
let started = false;
for (; i < s.length; i++) {
  const ch = s[i];
  if (ch === "{") { brace++; started = true; }
  else if (ch === "}") { brace--; }
  if (started && brace === 0) { i++; break; }
}
const fnText = s.slice(iFn, i);

// Convert to valid global assignment (NOT "async function globalThis...")
const fnAssigned = fnText.replace(
  /^async\s+function\s+callOpenAIChat\s*\(/m,
  "globalThis.callOpenAIChat = async function callOpenAIChat("
);

// Find /brain/chat handler using regex (handles " or ' and whitespace)
const reChat = /app\.post\(\s*["']\/brain\/chat["']\s*,/m;
const m = s.match(reChat);
if (!m || typeof m.index !== "number") {
  console.log("PATCH_FAIL: /brain/chat handler not found by regex", { file, backup });
  process.exit(3);
}
const iAnchor = m.index;

// Inject lifted function right before handler
const inject = `\n  // --- HOTFIX: lift callOpenAIChat into globalThis (scope-safe)\n  ${fnAssigned}\n\n`;
s = s.slice(0, iAnchor) + inject + s.slice(iAnchor);

// Update handler call sites (scope-safe)
let replaced = 0;
s = s.replace(/\bawait\s+callOpenAIChat\s*\(/g, () => { replaced++; return "await globalThis.callOpenAIChat("; });

// Remove the dead/broken __extract block if present (it’s harmless but confusing)
s = s.replace(
  /\n\s*const __extract = \(typeof extractMessages === "function"\)[\s\S]*?\n\s*if \(typeof __extract !== "function"\) \{\s*\n\s*\}\s*\n/m,
  "\n"
);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, injectedAt: iAnchor, replacedCalls: replaced });

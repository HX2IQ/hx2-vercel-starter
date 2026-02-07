const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_lift_callOpenAIChat_global_${stamp}`;
fs.copyFileSync(file, backup);

// Skip if already lifted
if (s.includes("globalThis.callOpenAIChat")) {
  console.log("PATCH_SKIP: globalThis.callOpenAIChat already present", { file, backup });
  process.exit(0);
}

const sig = "async function callOpenAIChat(messages) {";
const iFn = s.indexOf(sig);
if (iFn === -1) {
  console.log("PATCH_FAIL: callOpenAIChat signature not found", { file, backup });
  process.exit(2);
}

// Extract function text by brace counting
let i = iFn;
let brace = 0;
let started = false;
for (; i < s.length; i++) {
  const ch = s[i];
  if (ch === "{") { brace++; started = true; }
  else if (ch === "}") { brace--; }
  if (started && brace === 0) { i++; break; }
}

const fnText = s.slice(iFn, i); // includes "async function callOpenAIChat..." block

// Convert "async function callOpenAIChat(messages) { ... }"
// into "globalThis.callOpenAIChat = async function callOpenAIChat(messages) { ... }"
const fnAssigned = fnText.replace(
  /^async\s+function\s+callOpenAIChat\s*\(/m,
  "globalThis.callOpenAIChat = async function callOpenAIChat("
);

// Inject before the /brain/chat route (so it is definitely defined for that handler)
const anchor = '\n  app.post("/brain/chat", async (req, res) => {';
const iAnchor = s.indexOf(anchor);
if (iAnchor === -1) {
  console.log("PATCH_FAIL: /brain/chat anchor not found", { file, backup });
  process.exit(3);
}

const inject = `\n  // --- HOTFIX: lift callOpenAIChat into globalThis (scope-safe)\n  ${fnAssigned}\n\n`;
s = s.slice(0, iAnchor) + inject + s.slice(iAnchor);

// Update handler call to use globalThis (avoid scope issues)
let changed = 0;
s = s.replace(/await\s+callOpenAIChat\(/g, () => { changed++; return "await globalThis.callOpenAIChat("; });

// Optional: remove the broken unused __extract snippet block (lines ~178-183 in your output)
s = s.replace(
  /\n\s*const __extract = \(typeof extractMessages === "function"\)[\s\S]*?\n\s*if \(typeof __extract !== "function"\) \{\s*\n\s*\}\s*\n/m,
  "\n"
);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, lifted: true, replacedCalls: changed });

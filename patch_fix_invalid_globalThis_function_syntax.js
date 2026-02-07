const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_fix_invalid_globalThis_fn_${stamp}`;
fs.copyFileSync(file, backup);

// Fix invalid syntax: "async function globalThis.callOpenAIChat("
const re = /async\s+function\s+globalThis\.callOpenAIChat\s*\(/g;
if (!re.test(s)) {
  console.log("PATCH_SKIP: invalid declaration not found", { file, backup });
  process.exit(0);
}

// Replace with valid assignment form.
// Keep the "async" + params intact.
s = s.replace(re, "globalThis.callOpenAIChat = async function callOpenAIChat(");

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, change: "Rewrote invalid async function globalThis.callOpenAIChat(...) to globalThis.callOpenAIChat = async function callOpenAIChat(...)" });

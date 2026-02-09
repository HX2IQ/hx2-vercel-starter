import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_fix_injectStr_param_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) Make callOpenAIChat accept injectStr as a parameter (if it doesn't already)
src = src.replace(
  /async function\s+callOpenAIChat\s*\(\s*message\s*\)\s*\{/,
  'async function callOpenAIChat(message, injectStr) {'
);

// 2) Replace any callOpenAIChat(message) invocation with callOpenAIChat(message, inject)
//    (only if the line has "callOpenAIChat(" and does NOT already pass a 2nd arg)
src = src.replace(
  /callOpenAIChat\s*\(\s*message\s*\)/g,
  'callOpenAIChat(message, inject)'
);

// 3) Safety: if the file has callOpenAIChat(req.body.message) style, leave it alone.
//    (No-op intentionally)

// Write
fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
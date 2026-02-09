import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_pass_inject_into_callOpenAIChat_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) Update function signature: callOpenAIChat(message) -> callOpenAIChat(message, injectStr)
src = src.replace(
  /function\s+callOpenAIChat\s*\(\s*message\s*\)/,
  "function callOpenAIChat(message, injectStr)"
);

// Also handle async form if used: async function callOpenAIChat(message)
src = src.replace(
  /async\s+function\s+callOpenAIChat\s*\(\s*message\s*\)/,
  "async function callOpenAIChat(message, injectStr)"
);

// 2) Inside callOpenAIChat, replace hx2SystemWithMemory(inject) -> hx2SystemWithMemory(injectStr)
src = src.replace(
  /hx2SystemWithMemory\(\s*inject\s*\)/g,
  "hx2SystemWithMemory(injectStr)"
);

// 3) Update call sites: callOpenAIChat(message) -> callOpenAIChat(message, inject)
// We ONLY patch the exact pattern that uses (message) to avoid breaking other calls.
src = src.replace(
  /callOpenAIChat\(\s*message\s*\)/g,
  "callOpenAIChat(message, inject)"
);

// 4) Safety: if there is still any "hx2SystemWithMemory(inject)" left, fail-fast by commenting it out
// (should not trigger; but prevents silent broken deploys)
if (/hx2SystemWithMemory\(\s*inject\s*\)/.test(src)) {
  throw new Error("Patch incomplete: found remaining hx2SystemWithMemory(inject) reference.");
}

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
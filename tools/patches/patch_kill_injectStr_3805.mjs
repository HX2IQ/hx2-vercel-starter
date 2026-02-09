import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_kill_injectStr_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) hx2SystemWithMemory(injectStr) -> hx2SystemWithMemory(inject)
src = src.replace(/\bhx2SystemWithMemory\s*\(\s*injectStr\s*\)/g, "hx2SystemWithMemory(inject)");

// 2) function hx2SystemWithMemory(injectStr) -> function hx2SystemWithMemory(inject)
src = src.replace(/function\s+hx2SystemWithMemory\s*\(\s*injectStr\s*\)/g, "function hx2SystemWithMemory(inject)");

// 3) Replace remaining injectStr tokens -> inject
src = src.replace(/\binjectStr\b/g, "inject");

// Write
fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
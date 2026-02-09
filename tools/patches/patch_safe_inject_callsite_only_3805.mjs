import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_safe_inject_callsite_only_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) Force the function definition to a sane signature if it exists (repair guard)
src = src.replace(
  /function\s+hx2SystemWithMemory\s*\(\s*[^)]*\s*\)\s*\{/g,
  'function hx2SystemWithMemory(inject) {'
);

// 2) Replace ONLY call sites (not definitions): hx2SystemWithMemory(inject)
src = src.replace(
  /\bhx2SystemWithMemory\s*\(\s*inject\s*\)/g,
  'hx2SystemWithMemory((typeof inject === "undefined") ? "" : inject)'
);

// 3) If the callsite was accidentally turned into hx2SystemWithMemory(injectStr) earlier, normalize it too
src = src.replace(
  /\bhx2SystemWithMemory\s*\(\s*injectStr\s*\)/g,
  'hx2SystemWithMemory((typeof inject === "undefined") ? "" : inject)'
);

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
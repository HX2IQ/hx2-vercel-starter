import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_safe_inject_reference_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// Replace hx2SystemWithMemory(inject) with a safe expression that won't throw if inject is undefined
src = src.replace(
  /\bhx2SystemWithMemory\s*\(\s*inject\s*\)/g,
  'hx2SystemWithMemory((typeof inject === "undefined") ? "" : inject)'
);

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
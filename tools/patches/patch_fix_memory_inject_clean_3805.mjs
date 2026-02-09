import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_fix_memory_inject_clean_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) Fix ANY broken hx2SystemWithMemory signature line to a valid signature.
//    We do this line-based so we never get tricked by nested parentheses.
src = src.replace(
  /^(\s*)function\s+hx2SystemWithMemory\s*\(.*\)\s*\{\s*$/m,
  `$1function hx2SystemWithMemory(inject) {`
);

// 2) ONLY adjust the system-message callsite (not global).
//    This prevents accidentally rewriting other parts of the code.
src = src.replace(
  /(\{\s*role:\s*"system"\s*,\s*content:\s*)hx2SystemWithMemory\(\s*inject\s*\)(\s*\}\s*,?)/,
  `$1hx2SystemWithMemory((typeof inject === "undefined") ? "" : inject)$2`
);

// 3) If callsite used injectStr from older patches, normalize it too.
src = src.replace(
  /(\{\s*role:\s*"system"\s*,\s*content:\s*)hx2SystemWithMemory\(\s*injectStr\s*\)(\s*\}\s*,?)/,
  `$1hx2SystemWithMemory((typeof inject === "undefined") ? "" : inject)$2`
);

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
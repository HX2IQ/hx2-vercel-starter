import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_fix_memory_inject_scope_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) Remove the module-scope "inject" reference by replacing the bad const line
//    Turn it into HX2_SYSTEM_BASE (no inject)
src = src.replace(
  /^(\s*)const\s+HX2_SYSTEM_WITH_MEMORY\s*=\s*\(HX2_SYSTEM_PROMPT\s*\|\|\s*""\)\s*\+\s*\(inject\s*\|\|\s*""\)\s*;\s*$/m,
  `$1const HX2_SYSTEM_BASE = (HX2_SYSTEM_PROMPT || "");`
);

// If that exact line didn't match (formatting differs), fall back to a broader replace:
if (!src.includes("const HX2_SYSTEM_BASE") && src.includes("HX2_SYSTEM_WITH_MEMORY") && src.includes("(inject ||")) {
  src = src.replace(
    /const\s+HX2_SYSTEM_WITH_MEMORY\s*=\s*\(HX2_SYSTEM_PROMPT\s*\|\|\s*""\)\s*\+\s*\(inject\s*\|\|\s*""\)\s*;/,
    `const HX2_SYSTEM_BASE = (HX2_SYSTEM_PROMPT || "");`
  );
}

// 2) Ensure helper exists (insert after HX2_SYSTEM_BASE if possible)
if (!src.includes("function hx2SystemWithMemory(")) {
  const helper = `
function hx2SystemWithMemory(injectStr) {
  try {
    return String(HX2_SYSTEM_BASE || "") + String(injectStr || "");
  } catch {
    return String(HX2_SYSTEM_BASE || "");
  }
}
`;
  if (src.includes("const HX2_SYSTEM_BASE")) {
    src = src.replace(/const\s+HX2_SYSTEM_BASE[^\n]*\n/, (m) => m + helper + "\n");
  } else {
    // safest prepend near top if base isn't found (shouldn't happen)
    src = helper + "\n" + src;
  }
}

// 3) Replace remaining references to HX2_SYSTEM_WITH_MEMORY to use per-request inject
//    IMPORTANT: this is only safe now that we removed the module-scope bad line.
src = src.replace(/\bHX2_SYSTEM_WITH_MEMORY\b/g, "hx2SystemWithMemory(inject)");

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_fix_inject_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// detect
const hasInjectRef = /\binject\b/.test(src);
const hasInjectDef = /function\s+inject\b|const\s+inject\b|let\s+inject\b|var\s+inject\b/.test(src);

if (hasInjectRef && !hasInjectDef) {
  const helper = `
function inject(base, extra) {
  try {
    if (!extra) return base;

    // String prompt case
    if (typeof base === "string") {
      const s = String(base || "");
      const e = Array.isArray(extra) ? extra.join("\\n") : String(extra);
      return (s + "\\n\\n" + e).trim();
    }

    // Messages array case
    if (Array.isArray(base)) {
      const add = Array.isArray(extra) ? extra : [extra];
      return base.concat(add).filter(Boolean);
    }

    return base;
  } catch {
    return base;
  }
}
`;

  // Insert after imports if possible, else prepend
  if (/^(import .*?\n)+/m.test(src)) {
    src = src.replace(/^(import .*?\n)+/m, (m) => m + helper + "\n");
  } else {
    src = helper + "\n" + src;
  }
}

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
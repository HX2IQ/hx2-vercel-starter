import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_load_brainpack_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// 1) Ensure fs import exists (your file might not have it)
if (!src.includes('from "fs"') && !src.includes("require('fs'") && !src.includes('require("fs"')) {
  // If you already use ESM imports, add fs import near top
  src = src.replace(/^(import .+\n)+/m, (m) => m + 'import fs from "fs";\n');
  if (!src.includes('import fs from "fs";')) {
    // fallback: prepend
    src = 'import fs from "fs";\n' + src;
  }
}

// 2) Add loader helper if missing
if (!src.includes("function loadSystemPrompt")) {
  src += `

function loadSystemPrompt() {
  try {
    const p = process.env.HX2_SYSTEM_PROMPT_FILE;
    if (!p) return null;
    const t = fs.readFileSync(p, "utf8");
    return (t || "").trim() || null;
  } catch {
    return null;
  }
}
`;
}

// 3) Replace the hard-coded system message content with the file-loaded prompt (fallback to existing)
//
// We look for a system role object and replace its content field with a variable.
if (!src.includes("const HX2_SYSTEM_PROMPT")) {
  src = src.replace(
    /async function callOpenAI\([\s\S]*?\)\s*\{/m,
    (m) => m + `\n  const HX2_SYSTEM_PROMPT = loadSystemPrompt() || "You are HX2 Brain. Be helpful and concise. Do not echo the user.";\n`
  );
}

// Replace system content line if present
src = src.replace(
  /\{\s*role:\s*["']system["']\s*,\s*content:\s*["'][^"']*["']\s*\}/g,
  `{ role: "system", content: HX2_SYSTEM_PROMPT }`
);

// 4) Update brain_version marker if present
src = src.replace(/brain_version:\s*["'][^"']+["']/g, `brain_version: "hx2-brain-shell-v0.3-brainpack"`);

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);

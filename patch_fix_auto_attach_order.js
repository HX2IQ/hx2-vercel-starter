const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_fix_auto_attach_order_${stamp}`;
fs.copyFileSync(file, backup);

let changed = 0;

// 1) Remove the premature AUTO-ATTACH finalize block (the TDZ culprit)
const prematureRe = /\n\s*\/\/ --- AUTO-ATTACH finalize ---\s*\n[\s\S]*?\n\s*const app = express\(\);\n/;
if (prematureRe.test(s)) {
  s = s.replace(prematureRe, "\nconst app = express();\n");
  changed++;
} else {
  console.log("PATCH_WARN: premature finalize block not found (pattern mismatch) — will proceed with reorder only");
}

// 2) Remove the old boot block (we will re-insert it in a safe place)
const bootRe = /\n\s*\/\/ --- AUTO-ATTACH \(boot persistence\) ---\s*\n\s*\/\/ If BRAIN_AUTO_ATTACH=true and attach is allowed, start with brain attached\.\s*\n\s*const AUTO_ATTACH = [^\n]*\n\s*const AUTO_VER\s*=[^\n]*\n\s*\/\/ Note: allowAttach is computed later; we finalize after allowAttach exists\.\s*\n/;
if (bootRe.test(s)) {
  s = s.replace(bootRe, "\n");
  changed++;
} else {
  console.log("PATCH_WARN: boot block not found (pattern mismatch) — will still insert safe block");
}

// 3) Insert safe boot auto-attach AFTER brainAttached/brainVersion exist.
// We anchor right after: let brainVersion = null;
const anchor = /(\n\s*let\s+brainAttached\s*=\s*false\s*;\s*\n\s*let\s+brainVersion\s*=\s*null\s*;\s*)/;
if (!anchor.test(s)) {
  console.log("PATCH_FAIL: anchor (brainAttached/brainVersion) not found");
  process.exit(2);
}

const insert =
`\n\n  // --- AUTO-ATTACH (boot persistence) ---
  // If BRAIN_AUTO_ATTACH=true and attach is allowed, start with brain attached.
  const __AUTO_ATTACH = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";
  const __AUTO_VER    = String(process.env.BRAIN_VERSION || "v2.2");
  if (__AUTO_ATTACH && allowAttach) {
    brainAttached = true;
    brainVersion  = __AUTO_VER || brainVersion || "v2.2";
  }\n`;

s = s.replace(anchor, `$1${insert}`);
changed++;

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

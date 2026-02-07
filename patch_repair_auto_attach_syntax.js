const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_repair_auto_attach_${stamp}`;
fs.copyFileSync(file, backup);

let changed = 0;

// A) Remove the premature finalize block (it references AUTO_ATTACH before declaration AND brain vars before init)
const prematureRe = /\n\s*\/\/ --- AUTO-ATTACH finalize ---\s*\n[\s\S]*?\n\s*const app = express\(\);\n/;
if (prematureRe.test(s)) {
  s = s.replace(prematureRe, "\nconst app = express();\n");
  changed++;
} else {
  console.log("PATCH_NOTE: premature finalize block not found (ok if already removed)");
}

// B) Repair the broken const AUTO_ATTACH line if it was mangled
// Replace ANY const-line that assigns from process.env.BRAIN_AUTO_ATTACH but isn't "const AUTO_ATTACH = ..."
const badAutoAttachLineRe = /^\s*const\s+.*BRAIN_AUTO_ATTACH.*$/m;
if (badAutoAttachLineRe.test(s)) {
  s = s.replace(badAutoAttachLineRe, '  const AUTO_ATTACH = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";');
  changed++;
} else {
  console.log("PATCH_NOTE: no BRAIN_AUTO_ATTACH const line found to repair");
}

// C) Remove any previously inserted boot block to avoid duplicates
const bootBlockRe = /\n\s*\/\/ --- AUTO-ATTACH \(boot persistence\) ---[\s\S]*?\n\s*}\s*\n/g;
if (bootBlockRe.test(s)) {
  s = s.replace(bootBlockRe, "\n");
  changed++;
}

// D) Insert a correct boot auto-attach block AFTER brainAttached/brainVersion exist
const anchor = /(\n\s*let\s+brainAttached\s*=\s*false\s*;\s*\n\s*let\s+brainVersion\s*=\s*null\s*;\s*)/;
if (!anchor.test(s)) {
  console.log("PATCH_FAIL: anchor (brainAttached/brainVersion) not found");
  process.exit(2);
}

const insert =
`\n\n  // --- AUTO-ATTACH (boot persistence) ---
  // If BRAIN_AUTO_ATTACH=true and attach is allowed, start with brain attached.
  const __AUTO_VER = String(process.env.BRAIN_VERSION || "v2.2");
  if (AUTO_ATTACH && allowAttach) {
    brainAttached = true;
    brainVersion  = __AUTO_VER || brainVersion || "v2.2";
  }\n`;

s = s.replace(anchor, `$1${insert}`);
changed++;

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

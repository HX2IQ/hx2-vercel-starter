const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_clean_auto_attach_${stamp}`;
fs.copyFileSync(file, backup);

const startAnchor = /(\n\s*let\s+brainVersion\s*=\s*null\s*;\s*\n)/;
const endAnchor   = /(\n\s*function\s+nowIso\s*\(\)\s*\{\s*\n)/;

if (!startAnchor.test(s)) {
  console.log("PATCH_FAIL: start anchor 'let brainVersion = null;' not found");
  process.exit(2);
}
if (!endAnchor.test(s)) {
  console.log("PATCH_FAIL: end anchor 'function nowIso()' not found");
  process.exit(3);
}

const parts = s.split(startAnchor);
if (parts.length < 3) {
  console.log("PATCH_FAIL: could not split on start anchor");
  process.exit(4);
}

// Rebuild using a safer slice method:
const mStart = s.match(startAnchor);
const mEnd   = s.match(endAnchor);

const startIdx = s.indexOf(mStart[0]) + mStart[0].length;
const endIdx   = s.indexOf(mEnd[0]);

if (endIdx <= startIdx) {
  console.log("PATCH_FAIL: end anchor occurs before start anchor");
  process.exit(5);
}

const before = s.slice(0, startIdx);
const after  = s.slice(endIdx);

const clean =
`\n  // --- AUTO-ATTACH (boot persistence) ---
  // If BRAIN_AUTO_ATTACH=true and attach is allowed, start with brain attached.
  const AUTO_ATTACH = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";
  const AUTO_VER    = String(process.env.BRAIN_VERSION || "v2.2");
  if (AUTO_ATTACH && allowAttach) {
    brainAttached = true;
    brainVersion  = AUTO_VER || brainVersion || "v2.2";
  }\n\n`;

s = before + clean + after;

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

// Safety checks: no illegal const, no mangled const, no duplicate boot headers
const bad1 = /^\s*const\s+String\s*\(/m.test(s);
const bad2 = /^\s*const\s*\(\(/m.test(s);
const dup  = (s.match(/AUTO-ATTACH \(boot persistence\)/g) || []).length;

console.log("CHECKS", { bad_const_String: bad1, bad_const_paren: bad2, boot_headers: dup });

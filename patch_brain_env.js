/**
 * BOP2 patch: ensure brain-shell loads env files at runtime.
 * - Adds dotenv loading for .env.local, .env.production.local, .env (if present)
 * - Also tries to ensure allow_brain_attach reads from process.env
 */
const fs = require("fs");
const path = require("path");

const target = path.join(process.argv[2] || ".", "server.js");

if (!fs.existsSync(target)) {
  console.error("PATCH ERROR: server.js not found at:", target);
  process.exit(2);
}

let s = fs.readFileSync(target, "utf8");

const bootstrap = `
// --- HX2 ENV BOOTSTRAP (BOP2) ---
try {
  const fs = require("fs");
  const path = require("path");
  const dotenv = require("dotenv");
  const cwd = process.cwd();
  const candidates = [".env.local", ".env.production.local", ".env"];
  for (const f of candidates) {
    const p = path.join(cwd, f);
    if (fs.existsSync(p)) dotenv.config({ path: p });
  }
} catch (e) {
  // ignore
}
// --- /HX2 ENV BOOTSTRAP (BOP2) ---

`;

if (!s.includes("HX2 ENV BOOTSTRAP (BOP2)")) {
  // Insert bootstrap near the top, after any "use strict" if present
  if (s.startsWith('"use strict"') || s.startsWith("'use strict'")) {
    const firstLineEnd = s.indexOf("\n");
    s = s.slice(0, firstLineEnd + 1) + bootstrap + s.slice(firstLineEnd + 1);
  } else {
    s = bootstrap + s;
  }
}

let changedAllow = false;

// Common patterns we’ve seen: allowBrainAttach hard-coded false
const patterns = [
  { re: /const\s+allowBrainAttach\s*=\s*false\s*;/g, rep: 'const allowBrainAttach = String(process.env.ALLOW_BRAIN_ATTACH||"").toLowerCase()==="true";' },
  { re: /let\s+allowBrainAttach\s*=\s*false\s*;/g,   rep: 'let allowBrainAttach = String(process.env.ALLOW_BRAIN_ATTACH||"").toLowerCase()==="true";' },
];

for (const p of patterns) {
  if (p.re.test(s)) {
    s = s.replace(p.re, p.rep);
    changedAllow = true;
  }
}

// If the status JSON literal hardcodes allow_brain_attach:false, fix it
if (s.includes("allow_brain_attach") && s.includes("allow_brain_attach: false")) {
  s = s.replace(/allow_brain_attach:\s*false/g, "allow_brain_attach: allowBrainAttach");
  changedAllow = true;
}

// Backup
const bak = target + ".bak_" + Date.now();
fs.copyFileSync(target, bak);

// Write patched
fs.writeFileSync(target, s, "utf8");

console.log("PATCH OK");
console.log("server.js:", target);
console.log("backup:", bak);
console.log("changedAllow:", changedAllow);

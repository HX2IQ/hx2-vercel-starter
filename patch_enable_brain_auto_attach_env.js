const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_auto_attach_${stamp}`;
fs.copyFileSync(file, backup);

// Idempotency check
if (s.includes("BRAIN_AUTO_ATTACH") && s.includes("AUTO_ATTACH")) {
  console.log("PATCH_SKIP: auto-attach logic already present", { file, backup });
  process.exit(0);
}

// Find where brainAttached is declared
const m = s.match(/let\s+brainAttached\s*=\s*false\s*;\s*\n\s*let\s+brainVersion\s*=\s*null\s*;/);
if (!m) {
  console.log("PATCH_FAIL: could not find brainAttached/brainVersion declarations");
  process.exit(2);
}

const inject = `
  // --- AUTO-ATTACH (boot persistence) ---
  // If BRAIN_AUTO_ATTACH=true and attach is allowed, start with brain attached.
  const AUTO_ATTACH = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";
  const AUTO_VER    = String(process.env.BRAIN_VERSION || "v2.2");
  // Note: allowAttach is computed later; we finalize after allowAttach exists.
`;

s = s.replace(m[0], m[0] + "\n" + inject);

// Now locate allowAttach definition so we can finalize attachment after it exists
// Common pattern: const allowAttach = ...
const idxAllow = s.search(/const\s+allowAttach\s*=\s*/);
if (idxAllow === -1) {
  console.log("PATCH_FAIL: could not find allowAttach definition");
  process.exit(3);
}

// Insert finalizer right AFTER the line that defines allowAttach (end of that statement)
const endLine = s.indexOf("\n", idxAllow);
if (endLine === -1) {
  console.log("PATCH_FAIL: could not locate end of allowAttach line");
  process.exit(4);
}

const finalize = `
  // --- AUTO-ATTACH finalize ---
  if (AUTO_ATTACH && allowAttach) {
    brainAttached = true;
    brainVersion  = AUTO_VER || brainVersion || "v2.2";
  }
`;

s = s.slice(0, endLine + 1) + finalize + s.slice(endLine + 1);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

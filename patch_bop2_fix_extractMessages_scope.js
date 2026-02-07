const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_fix_extractMessages_scope_${stamp}`;
fs.copyFileSync(file, backup);

// Find the exact function declaration line (with the same indentation you showed)
const anchor = "\n  function extractMessages(body) {";
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: anchor not found:", anchor.trim());
  process.exit(2);
}

// If there is already a closing brace immediately before this function, do nothing
const pre = s.slice(Math.max(0, idx - 300), idx);
if (/\n\s*}\s*\n\s*$/.test(pre)) {
  console.log("PATCH_SKIP: closing brace already present before extractMessages", { file, backup });
  process.exit(0);
}

// Insert a missing close brace to end the prior function (extractMsg)
s = s.slice(0, idx) + "\n}\n" + s.slice(idx);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, inserted: "missing } before extractMessages" });

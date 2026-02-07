const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_hard_fix_mangled_auto_attach_${stamp}`;
fs.copyFileSync(file, backup);

let changed = 0;

// Replace the exact mangled const line created by earlier AUTO_ATTACH token replacement
// Example:
// const ((process.env.AUTO_ATTACH||"").toLowerCase()==="true") = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";
const mangledLineRe = /^\s*const\s*\(\(process\.env\.AUTO_ATTACH[^\n]*BRAIN_AUTO_ATTACH[^\n]*$/m;
if (mangledLineRe.test(s)) {
  s = s.replace(
    mangledLineRe,
    '  const AUTO_ATTACH = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";'
  );
  changed++;
} else {
  console.log("PATCH_NOTE: mangled AUTO_ATTACH const line not found by primary pattern");
}

// Fallback: if the line is even more mangled (spacing variants), replace any "const ((" line that contains BRAIN_AUTO_ATTACH
const fallbackRe = /^\s*const\s*\(\([^\n]*BRAIN_AUTO_ATTACH[^\n]*$/m;
if (fallbackRe.test(s)) {
  s = s.replace(
    fallbackRe,
    '  const AUTO_ATTACH = String(process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true";'
  );
  changed++;
}

// Also remove any other illegal "const ((" lines that might exist (defensive)
const illegalConstRe = /^\s*const\s*\(\([^\n]*$/gm;
const illegalMatches = s.match(illegalConstRe) || [];
if (illegalMatches.length > 0) {
  // Only remove if it still exists AFTER our replacement attempts
  const stillBad = (s.match(illegalConstRe) || []);
  if (stillBad.length > 0) {
    s = s.replace(illegalConstRe, "// [removed illegal const (( ... line)]");
    changed += stillBad.length;
  }
}

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

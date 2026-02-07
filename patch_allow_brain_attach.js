const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
fs.copyFileSync(file, file + `.bak_allow_${stamp}`);

let changed = false;

// Insert env-derived constant once
if (!s.includes("const __ALLOW_BRAIN_ATTACH")) {
  const insertBlock = `
const __ALLOW_BRAIN_ATTACH = String(process.env.ALLOW_BRAIN_ATTACH || "").toLowerCase() === "true";
`;

  const dotenvIdx = s.indexOf("dotenv");
  if (dotenvIdx !== -1) {
    const lineEnd = s.indexOf("\n", dotenvIdx);
    s = s.slice(0, lineEnd + 1) + insertBlock + s.slice(lineEnd + 1);
  } else {
    const firstNL = s.indexOf("\n");
    s = s.slice(0, firstNL + 1) + insertBlock + s.slice(firstNL + 1);
  }
  changed = true;
}

// Replace hardcoded false in status response
{
  const before = s;
  s = s.replace(/allow_brain_attach:\s*false/g, "allow_brain_attach: __ALLOW_BRAIN_ATTACH");
  if (s !== before) changed = true;
}

// Replace common hardcoded allow vars
{
  const before = s;
  s = s.replace(/(const\s+allowBrainAttach\s*=\s*)false/g, "$1__ALLOW_BRAIN_ATTACH");
  s = s.replace(/(const\s+ALLOW_BRAIN_ATTACH\s*=\s*)false/g, "$1__ALLOW_BRAIN_ATTACH");
  if (s !== before) changed = true;
}

// Normalize common guards
{
  const before = s;
  s = s.replace(/if\s*\(\s*!ALLOW_BRAIN_ATTACH\s*\)/g, "if (!__ALLOW_BRAIN_ATTACH)");
  s = s.replace(/if\s*\(\s*!allowBrainAttach\s*\)/g, "if (!__ALLOW_BRAIN_ATTACH)");
  if (s !== before) changed = true;
}

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_ALLOW_OK", { file, changed, backup: file + `.bak_allow_${stamp}` });

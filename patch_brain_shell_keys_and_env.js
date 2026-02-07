const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_bop2_${stamp}`;
fs.copyFileSync(file, backup);

let changed = false;

// Ensure path is required (for absolute dotenv path)
if (!s.includes('const path = require("path");')) {
  // insert after dotenv require line
  s = s.replace(
    /const dotenv = require\("dotenv"\);\s*\n/,
    match => match + 'const path = require("path");\n'
  );
  changed = true;
}

// Make dotenv config absolute (PM2 cwd-safe)
s2 = s.replace(
  /dotenv\.config\(\{\s*path:\s*["']\.env\.local["']\s*\}\);/g,
  'dotenv.config({ path: path.join(__dirname, ".env.local") });'
);
if (s2 !== s) { s = s2; changed = true; }

// Unify owner key name: prefer HX2_OWNER_KEY, fallback to BRAIN_OWNER_KEY
s2 = s.replace(
  /const ownerKey = String\(process\.env\.BRAIN_OWNER_KEY \|\| ""\)\.trim\(\);\s*\/\/ optional/g,
  'const ownerKey = String(process.env.HX2_OWNER_KEY || process.env.BRAIN_OWNER_KEY || "").trim(); // optional'
);
if (s2 !== s) { s = s2; changed = true; }

// Force allowAttach to use the already-defined __ALLOW_BRAIN_ATTACH
s2 = s.replace(
  /const allowAttach = String\(process\.env\.ALLOW_BRAIN_ATTACH \|\| "false"\)\.toLowerCase\(\) === "true";/g,
  'const allowAttach = __ALLOW_BRAIN_ATTACH;'
);
if (s2 !== s) { s = s2; changed = true; }

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_BOP2_OK", { file, backup, changed });

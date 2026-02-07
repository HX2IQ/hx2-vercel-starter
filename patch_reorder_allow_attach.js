const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_reorder_allow_${stamp}`;
fs.copyFileSync(file, backup);

// 1) Ensure path require exists
if (!s.includes('const path = require("path");')) {
  s = s.replace(/const dotenv = require\("dotenv"\);\s*\n/, m => m + 'const path = require("path");\n');
}

// 2) Force dotenv config to absolute path (PM2 cwd-safe)
s = s.replace(
  /dotenv\.config\(\s*\{\s*path:\s*[^}]*\}\s*\)\s*;/g,
  'dotenv.config({ path: path.join(__dirname, ".env.local") });'
);
s = s.replace(
  /dotenv\.config\(\s*\)\s*;/g,
  'dotenv.config({ path: path.join(__dirname, ".env.local") });'
);

// If dotenv.config isn't present at all, fail loudly
if (!/dotenv\.config\(/.test(s)) {
  console.log("PATCH_FAIL: dotenv.config(...) not found in server.js");
  process.exit(1);
}

// 3) Remove any existing __ALLOW_BRAIN_ATTACH + allowAttach lines
s = s.replace(/^\s*const __ALLOW_BRAIN_ATTACH\s*=.*\r?\n/gm, "");
s = s.replace(/^\s*const allowAttach\s*=.*\r?\n/gm, "");

// 4) Insert __ALLOW_BRAIN_ATTACH and allowAttach immediately AFTER dotenv.config(...)
const insertBlock =
'const __ALLOW_BRAIN_ATTACH = String(process.env.ALLOW_BRAIN_ATTACH || "").toLowerCase() === "true";\n' +
'const allowAttach = __ALLOW_BRAIN_ATTACH;\n';

const marker = /dotenv\.config\([\s\S]*?\);\s*\r?\n/;
if (!marker.test(s)) {
  console.log("PATCH_FAIL: Could not match dotenv.config(...) line safely");
  process.exit(1);
}

s = s.replace(marker, (m) => m + insertBlock);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

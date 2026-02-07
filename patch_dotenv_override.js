const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_dotenv_override_${stamp}`;
fs.copyFileSync(file, backup);

let changed = false;

// Ensure dotenv.config has override:true and absolute path
const re = /dotenv\.config\(\{\s*path:\s*path\.join\(__dirname,\s*"\.env\.local"\)\s*\}\);/g;
const rep = 'dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });';

const s2 = s.replace(re, rep);
if (s2 !== s) { s = s2; changed = true; }

// Make __ALLOW_BRAIN_ATTACH robust (trim)
s = s.replace(
  /const __ALLOW_BRAIN_ATTACH\s*=\s*String\(process\.env\.ALLOW_BRAIN_ATTACH\s*\|\|\s*""\)\.toLowerCase\(\)\s*===\s*"true";/g,
  'const __ALLOW_BRAIN_ATTACH = String(process.env.ALLOW_BRAIN_ATTACH || "").trim().toLowerCase() === "true";'
);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_allow_after_dotenv_${stamp}`;
fs.copyFileSync(file, backup);

// Remove existing __ALLOW_BRAIN_ATTACH line (anywhere)
s = s.replace(/^\s*const __ALLOW_BRAIN_ATTACH\s*=.*\r?\n/gm, "");

// Match dotenv.config(...) even if it contains nested parens (e.g., path.join(...))
const marker = /dotenv\.config\([\s\S]*?\);\s*\r?\n/;
if (!marker.test(s)) {
  console.log("PATCH_SKIP: dotenv.config(...) not found");
  process.exit(1);
}

s = s.replace(marker, (m) => {
  return m + 'const __ALLOW_BRAIN_ATTACH = String(process.env.ALLOW_BRAIN_ATTACH || "").toLowerCase() === "true";\n';
});

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

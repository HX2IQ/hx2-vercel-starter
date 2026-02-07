const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_fix_auto_attach_tdz_${stamp}`;
fs.copyFileSync(file, backup);

// Replace any early "if (AUTO_ATTACH)" or "if(AUTO_ATTACH===true)" patterns
// with a safe env read that cannot TDZ.
let changed = 0;

// 1) if (AUTO_ATTACH) { ... }
s = s.replace(/\bif\s*\(\s*AUTO_ATTACH\s*\)/g, () => {
  changed++;
  return 'if (((process.env.AUTO_ATTACH || "").toLowerCase() === "true"))';
});

// 2) if (AUTO_ATTACH === true) / if (AUTO_ATTACH==true)
s = s.replace(/\bif\s*\(\s*AUTO_ATTACH\s*={2,3}\s*true\s*\)/g, () => {
  changed++;
  return 'if (((process.env.AUTO_ATTACH || "").toLowerCase() === "true"))';
});

// 3) ternary usage: AUTO_ATTACH ? ...
s = s.replace(/\bAUTO_ATTACH\s*\?/g, () => {
  changed++;
  return '(((process.env.AUTO_ATTACH || "").toLowerCase() === "true")) ?';
});

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

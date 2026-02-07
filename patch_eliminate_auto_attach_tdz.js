const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_eliminate_auto_attach_tdz_${stamp}`;
fs.copyFileSync(file, backup);

let changed = 0;

// 1) Replace any "if (AUTO_ATTACH && allowAttach)" with an env read that cannot TDZ
const ifRe = /\bif\s*\(\s*AUTO_ATTACH\s*&&\s*allowAttach\s*\)/g;
if (ifRe.test(s)) {
  s = s.replace(ifRe, 'if (((process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true") && allowAttach)');
  changed++;
}

// 2) Replace "brainVersion = AUTO_VER" style references with env read
const verRe = /\bAUTO_VER\b/g;
if (verRe.test(s)) {
  s = s.replace(verRe, 'String(process.env.BRAIN_VERSION || "v2.2")');
  changed++;
}

// 3) Replace ternary "AUTO_ATTACH ? ..." if present (safe env read)
const ternaryRe = /\bAUTO_ATTACH\s*\?/g;
if (ternaryRe.test(s)) {
  s = s.replace(ternaryRe, '(((process.env.BRAIN_AUTO_ATTACH || "").toLowerCase() === "true")) ?');
  changed++;
}

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

// Print any remaining references that could still TDZ
const lines = s.split("\n");
lines.forEach((line, idx) => {
  if (line.includes("AUTO_ATTACH") && !line.match(/const\s+AUTO_ATTACH\b/)) {
    console.log("REMAINING_REF", { line: idx + 1, text: line.trim() });
  }
});

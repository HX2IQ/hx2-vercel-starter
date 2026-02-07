const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
fs.copyFileSync(file, file + `.bak_dotenv_order_${stamp}`);

const lines = s.split(/\r?\n/);

// find allowAttach line
const idxAllow = lines.findIndex(l => l.includes("const allowAttach = String(process.env.ALLOW_BRAIN_ATTACH"));
if (idxAllow === -1) {
  console.log("PATCH_SKIP: allowAttach not found");
  process.exit(0);
}

// find dotenv config line (common patterns)
const idxDotenv = lines.findIndex(l =>
  l.includes("dotenv").toLowerCase() && (l.includes("config(") || l.includes("config();") || l.includes("dotenv/config"))
);

if (idxDotenv === -1) {
  console.log("PATCH_WARN: dotenv config line not found; printing first 40 lines for manual review.");
  console.log(lines.slice(0, 40).join("\n"));
  process.exit(0);
}

// if dotenv comes after allowAttach, move allowAttach to after dotenv
let changed = false;
if (idxDotenv > idxAllow) {
  const allowLine = lines[idxAllow];
  lines.splice(idxAllow, 1); // remove
  const insertAt = idxDotenv + 1; // right after dotenv
  lines.splice(insertAt, 0, allowLine);
  changed = true;
}

fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("PATCH_OK", { file, changed, backup: file + `.bak_dotenv_order_${stamp}` });

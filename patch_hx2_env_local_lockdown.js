const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, ".env.local");

let s = "";
if (fs.existsSync(file)) s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_lockdown_${stamp}`;
if (s) fs.writeFileSync(backup, s, "utf8");

// Parse existing env (preserve unknown keys)
const lines = s.split(/\r?\n/);
const map = new Map();
for (const line of lines) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  map.set(m[1], m[2]);
}

// Force SAFE defaults
map.set("ALLOW_BRAIN_ATTACH", "false");
map.set("BRAIN_AUTO_ATTACH", "false");
map.set("BRAIN_VERSION", "v2.2");

// Rebuild with stable ordering (important keys first)
const order = [
  "BIND",
  "PORT",
  "ALLOW_BRAIN_ATTACH",
  "BRAIN_AUTO_ATTACH",
  "BRAIN_VERSION",
  "HX2_OWNER_KEY",
  "BRAIN_OWNER_KEY"
];

const out = [];
for (const k of order) {
  if (map.has(k)) out.push(`${k}=${map.get(k)}`);
}

// Append remaining keys (sorted)
const rest = [...map.keys()].filter(k => !order.includes(k)).sort();
for (const k of rest) out.push(`${k}=${map.get(k)}`);

fs.writeFileSync(file, out.join("\n") + "\n", "utf8");

console.log("PATCH_OK", { file, backup, wrote: out.length });

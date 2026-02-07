const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_guard_extractMessages_${stamp}`;
fs.copyFileSync(file, backup);

// find the /brain/chat handler
const needle = 'app.post("/brain/chat", async (req, res) => {';
const idx = s.indexOf(needle);
if (idx === -1) {
  console.log("PATCH_FAIL: chat handler anchor not found");
  process.exit(1);
}

// if guard already present, skip
if (s.includes("extractMessages_missing_runtime")) {
  console.log("PATCH_SKIP: guard already present", { file, backup });
  process.exit(0);
}

// insert guard on the next line after handler open
const insertPos = idx + needle.length;
s = s.slice(0, insertPos) +
  '\n    if (typeof extractMessages !== "function") { throw new Error("extractMessages_missing_runtime"); }\n' +
  s.slice(insertPos);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

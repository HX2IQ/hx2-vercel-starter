const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_fix_chat_handler_${stamp}`;
fs.copyFileSync(file, backup);

const marker = 'app.post("/brain/chat", async (req, res) => {';
const i0 = s.indexOf(marker);
if (i0 === -1) {
  console.log("PATCH_FAIL: /brain/chat handler marker not found");
  process.exit(2);
}

// Replace the "throw outside try" pre-check with a safe extractor + early JSON return.
// 1) Replace the throw line:
//    if (typeof extractMessages !== "function") { throw new Error("extractMessages_missing_runtime"); }
//
// with:
//    const __extract = (typeof extractMessages === "function") ? extractMessages :
//                      (typeof globalThis.extractMessages === "function") ? globalThis.extractMessages : null;
//    if (typeof __extract !== "function") {
//      return res.status(500).json({ ok:false, error:"extractMessages_missing_runtime", where:"/brain/chat" });
//    }
//
// 2) Replace:
//    const msgs = extractMessages(req.body);
// with:
//    const msgs = __extract(req.body);

let changed = 0;

s = s.replace(
  /if\s*\(\s*typeof\s+extractMessages\s*!==\s*"function"\s*\)\s*\{\s*throw\s+new\s+Error\("extractMessages_missing_runtime"\);\s*\}/,
  () => {
    changed++;
    return [
      'const __extract = (typeof extractMessages === "function") ? extractMessages :',
      '                  (typeof globalThis.extractMessages === "function") ? globalThis.extractMessages : null;',
      'if (typeof __extract !== "function") {',
      '  return res.status(500).json({ ok: false, error: "extractMessages_missing_runtime", where: "/brain/chat" });',
      '}'
    ].join("\n");
  }
);

s = s.replace(
  /const\s+msgs\s*=\s*extractMessages\(\s*req\.body\s*\)\s*;/,
  () => {
    changed++;
    return 'const msgs = __extract(req.body);';
  }
);

if (changed < 2) {
  console.log("PATCH_FAIL: expected 2 replacements, got", changed, { file, backup });
  process.exit(3);
}

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

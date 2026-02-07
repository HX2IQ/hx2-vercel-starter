const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");

let s = fs.readFileSync(file, "utf8");
const stamp = Date.now();
const backup = file + `.bak_bop2_exdetail_${stamp}`;
fs.copyFileSync(file, backup);

const needle = 'return res.status(500).json({ ok: false, error: "brain_chat_exception" });';

if (!s.includes(needle)) {
  console.log("PATCH_FAIL: target catch return not found");
  process.exit(1);
}

const replacement =
`console.error("[brain_chat_exception]", e && e.stack ? e.stack : e);
    return res.status(500).json({
      ok: false,
      error: "brain_chat_exception",
      message: String((e && e.message) ? e.message : e),
      stack: (e && e.stack) ? String(e.stack) : null
    });`;

s = s.replace(needle, replacement);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

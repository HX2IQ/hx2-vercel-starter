const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_inject_extractMessages_${stamp}`;
fs.copyFileSync(file, backup);

// If already present, do nothing.
if (/function\s+extractMessages\s*\(/.test(s)) {
  console.log("PATCH_SKIP: extractMessages already exists", { file, backup });
  process.exit(0);
}

const anchor = 'app.post("/brain/chat"';
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: /brain/chat anchor not found");
  process.exit(1);
}

// Insert immediately BEFORE the /brain/chat handler so it's guaranteed in scope.
const insertAt = s.lastIndexOf("\n", idx);
const pre = insertAt === -1 ? "" : s.slice(0, insertAt + 1);
const post = insertAt === -1 ? s : s.slice(insertAt + 1);

const fn = `
function extractMessages(body) {
  const b = body || {};
  const input = b.input || b || {};
  const msgs = Array.isArray(input.messages) ? input.messages : (Array.isArray(b.messages) ? b.messages : []);
  // Normalize to [{role, content}] with string content
  return msgs
    .filter(m => m && typeof m === "object")
    .map(m => {
      const role = (m.role === "system" || m.role === "assistant" || m.role === "user") ? m.role : "user";
      let content = m.content;

      if (typeof content === "string") {
        // ok
      } else if (Array.isArray(content)) {
        // OpenAI-style multimodal array; pull text parts
        const parts = content.filter(x => x && x.type === "text" && typeof x.text === "string").map(x => x.text);
        content = parts.join("\n").trim();
      } else if (content == null) {
        content = "";
      } else {
        content = String(content);
      }

      return { role, content };
    });
}
`;

s = pre + fn + "\n" + post;

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

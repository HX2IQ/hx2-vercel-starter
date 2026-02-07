const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_bop2_insert_extractMessages_${stamp}`;
fs.copyFileSync(file, backup);

// no-op if already present
if (s.includes("function extractMessages(")) {
  console.log("PATCH_SKIP: extractMessages already exists", { file, backup });
  process.exit(0);
}

const anchor = 'app.post("/brain/chat"';
const idx = s.indexOf(anchor);
if (idx === -1) {
  console.log("PATCH_FAIL: /brain/chat anchor not found:", anchor);
  process.exit(1);
}

// insert at the start of the line containing app.post("/brain/chat"
let insertAt = s.lastIndexOf("\n", idx);
insertAt = insertAt === -1 ? 0 : insertAt + 1;

const shim = `
function extractMessages(body) {
  const _body = body || {};
  const _in = _body.input || _body || {};

  // If caller passed messages array, normalize to OpenAI chat format
  const msgs = Array.isArray(_in.messages) ? _in.messages : null;
  if (msgs && msgs.length) {
    return msgs.map(m => {
      const role = (m && typeof m.role === "string") ? m.role : "user";

      // accept string OR array-of-parts (vision-style) OR anything else
      let content = "";
      if (m && typeof m.content === "string") content = m.content;
      else if (m && Array.isArray(m.content)) {
        const part = m.content.find(x => x && x.type === "text" && typeof x.text === "string");
        content = part ? part.text : JSON.stringify(m.content);
      } else {
        content = JSON.stringify((m && m.content) ?? "");
      }

      return { role, content: String(content ?? "") };
    });
  }

  // Fallback: accept a single message field
  const msg =
    (typeof _in.message === "string") ? _in.message :
    (typeof _body.message === "string") ? _body.message :
    "";

  const text = String(msg || "").trim();
  return text ? [{ role: "user", content: text }] : [{ role: "user", content: "(empty message)" }];
}
`;

s = s.slice(0, insertAt) + shim + "\n" + s.slice(insertAt);
fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, inserted_before: anchor });

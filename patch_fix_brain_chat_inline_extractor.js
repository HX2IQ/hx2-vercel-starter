const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_inline_extractor_${stamp}`;
fs.copyFileSync(file, backup);

const marker = 'app.post("/brain/chat", async (req, res) => {';
const idx = s.indexOf(marker);
if (idx === -1) {
  console.log("PATCH_FAIL: /brain/chat handler not found");
  process.exit(2);
}

const inject = `
  // --- INLINE FALLBACK extractor (guaranteed, scope-safe)
  function __extractMessagesSafe(body) {
    const b = body || {};
    const input = b.input || b || {};
    if (Array.isArray(input.messages)) {
      return input.messages
        .filter(m => m && typeof m.role === "string")
        .map(m => {
          if (typeof m.content === "string") return { role: m.role, content: m.content };
          if (Array.isArray(m.content)) {
            const t = m.content.find(x => x && x.type === "text");
            return { role: m.role, content: t ? String(t.text || "") : "" };
          }
          return { role: m.role, content: "" };
        })
        .filter(m => m.content.trim().length > 0);
    }
    return [];
  }
`;

s = s.slice(0, idx + marker.length) + inject + s.slice(idx + marker.length);

// Replace usage to ALWAYS call the safe extractor
s = s.replace(
  /const\s+msgs\s*=\s*__extract\(\s*req\.body\s*\)\s*;/,
  'const msgs = __extractMessagesSafe(req.body);'
);

s = s.replace(
  /const\s+msgs\s*=\s*extractMessages\(\s*req\.body\s*\)\s*;/,
  'const msgs = __extractMessagesSafe(req.body);'
);

// Remove any remaining runtime throw
s = s.replace(
  /return\s+res\.status\(500\)\.json\([\s\S]*?extractMessages_missing_runtime[\s\S]*?\);?/g,
  ''
);

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup });

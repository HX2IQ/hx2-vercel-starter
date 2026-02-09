import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_memory_loader_3805.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

let src = fs.readFileSync(target, "utf8");

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// Ensure fs import exists (ESM)
if (!src.includes('import fs from "fs"')) {
  const m = src.match(/^(import .*?\n)+/m);
  if (m) src = src.replace(m[0], m[0] + 'import fs from "fs";\n');
  else src = 'import fs from "fs";\n' + src;
}

// Add helpers once
if (!src.includes("function hx2ReadFileSafe(")) {
  src += `

function hx2ReadFileSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}
function hx2LoadProfile(dir) {
  const t = hx2ReadFileSafe((dir || "") + "/profile.json");
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}
function hx2LoadMemLines(dir, maxLines = 60) {
  const t = hx2ReadFileSafe((dir || "") + "/mem.jsonl");
  if (!t) return null;
  const lines = t.split(/\\r?\\n/).map(s => s.trim()).filter(Boolean);
  if (!lines.length) return null;
  return lines.slice(Math.max(0, lines.length - maxLines));
}
function hx2GetHeader(req, name) {
  try { return (req.get && req.get(name)) || ""; } catch { return ""; }
}
function hx2GetSessionId(req) {
  return hx2GetHeader(req, "x-hx2-session") || hx2GetHeader(req, "x-hx2_session") || hx2GetHeader(req, "hx2-session") || "default";
}
function hx2MemoryDirForSession(sessionId) {
  const base = process.env.HX2_MEMORY_DIR || "/opt/hx2/memory/lTM";
  const ns = base + "/" + sessionId;
  try {
    if (fs.existsSync(ns + "/profile.json") || fs.existsSync(ns + "/mem.jsonl")) return ns;
  } catch {}
  return base;
}
function hx2BuildMemoryBlock(req) {
  const sid = hx2GetSessionId(req);
  const dir = hx2MemoryDirForSession(sid);
  const profile = hx2LoadProfile(dir);
  const mem = hx2LoadMemLines(dir, Number(process.env.HX2_MEMORY_MAXLINES || 60));

  const out = { session: sid, dir, has_profile: !!profile, has_mem: !!(mem && mem.length), mem_lines: mem ? mem.length : 0 };

  const profileText = profile ? JSON.stringify(profile).slice(0, 6000) : "";
  const memText = mem ? mem.join("\\n").slice(0, 12000) : "";

  const inject =
    "\\n\\n# HX2 MEMORY (Kickstart)\\n" +
    (profileText ? ("PROFILE_JSON: " + profileText + "\\n") : "PROFILE_JSON: (missing)\\n") +
    (memText ? ("MEM_JSONL_LAST_LINES:\\n" + memText + "\\n") : "MEM_JSONL_LAST_LINES: (missing)\\n");

  return { out, inject };
}
`;
}

// Add endpoint once
if (!src.includes('app.get("/brain/memory/status"')) {
  src += `

app.get("/brain/memory/status", (req, res) => {
  const { out } = hx2BuildMemoryBlock(req);
  res.json({ ok: true, ...out, brain_version: "hx2-brain-shell-v0.4-memory", mode: (process.env.HX2_MODE || "SAFE") });
});
`;
}

// Ensure /brain/chat injects memory
// 1) add inject line near the start of the /brain/chat handler body (best-effort)
if (!src.includes("const { inject } = hx2BuildMemoryBlock(req);")) {
  src = src.replace(
    /(app\.post\(\s*["']\/brain\/chat["'][\s\S]*?=>\s*\{)/m,
    "$1\n  const { inject } = hx2BuildMemoryBlock(req);\n"
  );
}

// 2) ensure HX2_SYSTEM_PROMPT exists and make HX2_SYSTEM_WITH_MEMORY
if (!src.includes("const HX2_SYSTEM_WITH_MEMORY")) {
  src = src.replace(
    /(const\s+HX2_SYSTEM_PROMPT\s*=\s*loadSystemPrompt\(\)\s*\|\|\s*["'][^"']*["'];)/m,
    `$1\n  const HX2_SYSTEM_WITH_MEMORY = (HX2_SYSTEM_PROMPT || "") + (inject || "");`
  );
}

// 3) swap system message to HX2_SYSTEM_WITH_MEMORY
src = src.replace(
  /\{\s*role:\s*["']system["']\s*,\s*content:\s*HX2_SYSTEM_PROMPT\s*\}/g,
  `{ role: "system", content: HX2_SYSTEM_WITH_MEMORY }`
);
src = src.replace(
  /\{\s*role:\s*["']system["']\s*,\s*content:\s*["'][^"']*["']\s*\}/g,
  `{ role: "system", content: HX2_SYSTEM_WITH_MEMORY }`
);

// Version marker
src = src.replace(/brain_version:\s*["'][^"']+["']/g, `brain_version: "hx2-brain-shell-v0.4-memory"`);

fs.writeFileSync(target, src, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);
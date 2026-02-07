const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "/opt/hx2/brain-shell";
const file = path.join(root, "server.js");
let s = fs.readFileSync(file, "utf8");

const stamp = Date.now();
const backup = file + `.bak_replace_auto_attach_token_${stamp}`;
fs.copyFileSync(file, backup);

let changed = 0;

// 1) Replace AUTO_ATTACH token usages everywhere (word boundary).
// NOTE: This will also affect "const AUTO_ATTACH = ..." so we remove that line next.
const safeExpr = '((process.env.AUTO_ATTACH||"").toLowerCase()==="true")';
const before = s;
s = s.replace(/\bAUTO_ATTACH\b/g, () => { changed++; return safeExpr; });

// 2) Remove a now-broken declaration line if present (after replacement it would look like: const ((process.env...)) = ...
// We remove any line that previously declared AUTO_ATTACH.
const declRe = /^[ \t]*(const|let|var)[ \t]+AUTO_ATTACH[ \t]*=.*$/gm;
if (declRe.test(before)) {
  s = s.replace(declRe, `// [patched] removed AUTO_ATTACH declaration (replaced with env expression)`); 
}

// 3) Also remove any "AUTO_ATTACH_VERSION" TDZ patterns if they exist similarly (optional, safe).
// (We only do it if the token exists.)
if (/\bAUTO_ATTACH_VERSION\b/.test(s)) {
  const verExpr = '(process.env.AUTO_ATTACH_VERSION||process.env.BRAIN_VERSION||"v2.2")';
  s = s.replace(/\bAUTO_ATTACH_VERSION\b/g, verExpr);
  // remove original declaration line if it existed in the original file
  const verDeclRe = /^[ \t]*(const|let|var)[ \t]+AUTO_ATTACH_VERSION[ \t]*=.*$/gm;
  s = s.replace(verDeclRe, `// [patched] removed AUTO_ATTACH_VERSION declaration (replaced with env expression)`);
}

fs.writeFileSync(file, s, "utf8");
console.log("PATCH_OK", { file, backup, changed });

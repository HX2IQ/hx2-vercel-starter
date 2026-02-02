const fs = require("fs");

const targets = [
  "app/api/brain/attach/route.ts",
  "app/api/brain/run/route.ts",
  "app/api/registry/node/install/route.ts",
  "app/api/registry/node/delete/route.ts",
  "app/api/registry/node/get/route.ts",   // optional (you may want owner-only)
  "app/api/registry/node/list/route.ts",  // optional (you may want owner-only)
];

function inject(file) {
  if (!fs.existsSync(file)) {
    console.log("skip (missing):", file);
    return;
  }

  let s = fs.readFileSync(file, "utf8");

  if (s.includes("requireOwner(")) {
    console.log("skip (already guarded):", file);
    return;
  }

  // Add import
  if (!s.includes('from "@/lib/auth/owner"')) {
    // Put after the first import line if possible.
    const lines = s.split(/\r?\n/);
    const firstImportIdx = lines.findIndex(l => l.startsWith("import "));
    if (firstImportIdx >= 0) {
      lines.splice(firstImportIdx + 1, 0, 'import { requireOwner } from "@/lib/auth/owner";');
      s = lines.join("\n");
    } else {
      s = 'import { requireOwner } from "@/lib/auth/owner";\n' + s;
    }
  }

  // Inject guard right after POST handler begins
  // Looks for: export async function POST(req: NextRequest) {
  s = s.replace(
    /(export\s+async\s+function\s+POST\s*\(\s*req\s*:\s*NextRequest\s*\)\s*\{\s*)/m,
    `$1\n  const g = requireOwner(req);\n  if (!g.ok) return g.res;\n`
  );

  // If it didn't match (different signature), do nothing to avoid breaking files.
  if (!s.includes("const g = requireOwner(req);")) {
    console.log("WARN: could not inject POST guard (signature mismatch):", file);
    return;
  }

  fs.writeFileSync(file, s.replace(/\n/g, "\r\n"), "utf8"); // keep CRLF on Windows
  console.log("patched:", file);
}

for (const f of targets) inject(f);
console.log("done");

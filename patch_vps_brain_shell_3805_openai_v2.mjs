import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_vps_brain_shell_3805_openai_v2.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

const src = fs.readFileSync(target, "utf8");

// Simple, robust patch: if we see the stub "ONLINE. Received:" we replace the handler portion.
// If not found, fail loudly.
if (!src.includes("ONLINE. Received:")) {
  console.error("Expected stub marker not found (ONLINE. Received:). Aborting to avoid unintended edits.");
  process.exit(2);
}

// Backup
const bak = `${target}.bak_${Date.now()}`;
fs.copyFileSync(target, bak);

// Minimal OpenAI Responses call block injected; keep existing Express wiring intact.
// We replace the stub reply construction only.
const out = src.replace(
  /reply:\s*["'`]HX2 BrainShell\(3805\) ONLINE\. Received:\s*\$\{[^}]+\}["'`]/g,
  `reply: await callOpenAI(message)`
);

// If callOpenAI doesn't exist, append it near bottom (idempotent-ish).
let final = out;
if (!final.includes("async function callOpenAI")) {
  final += `

async function callOpenAI(userText) {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing in environment");
  const body = {
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      { role: "system", content: "You are HX2 Brain. Be a helpful, concise assistant. Do NOT echo the user." },
      { role: "user", content: userText }
    ]
  };
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${key}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (!r.ok) throw new Error("OpenAI error: " + JSON.stringify(j).slice(0, 400));
  // Extract text safely
  const text =
    j?.output_text ??
    j?.output?.[0]?.content?.map(c => c?.text).filter(Boolean).join("") ??
    j?.response?.output_text ??
    null;
  return text || "OK";
}
`;
}

fs.writeFileSync(target, final, "utf8");
console.log("OK patched:", target);
console.log("Backup:", bak);

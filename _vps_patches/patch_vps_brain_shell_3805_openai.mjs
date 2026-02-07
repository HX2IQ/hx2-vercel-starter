import fs from "fs";

const target = process.argv[2];
if (!target) throw new Error("Usage: node patch_vps_brain_shell_3805_openai.mjs /path/to/server.js");
if (!fs.existsSync(target)) throw new Error("Target not found: " + target);

const src = fs.readFileSync(target, "utf8");
let out = src;

// 1) Ensure fetch exists (Node 18+ has global fetch; if not, we need undici)
// We'll assume Node has fetch; if not, you'll see a runtime error and we’ll hotfix.

function injectOnce(marker, code) {
  if (out.includes(marker)) return;
  out = out + "\n\n" + code + "\n";
}

// 2) Inject OpenAI helper
injectOnce("injected:callOpenAIChat:v1", `
/** injected:callOpenAIChat:v1 */
async function callOpenAIChat(message) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!key) throw new Error("OPENAI_API_KEY missing on VPS");

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + key
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are HX2 Brain. Be a real assistant. Do NOT echo the user." },
        { role: "user", content: String(message || "") }
      ]
    })
  });

  const j = await r.json().catch(() => ({}));
  const text = j?.choices?.[0]?.message?.content;

  if (!r.ok || !text) {
    throw new Error("OpenAI error: " + (j?.error?.message || r.status));
  }

  return text;
}
`);

// 3) Replace the echo reply payload
// Match: "HX2 BrainShell(3805) ONLINE. Received: ${message}"
const echo1 = /reply:\s*`HX2 BrainShell\(3805\)\s*ONLINE\.\s*Received:\s*\$\{message\}`/g;
const echo2 = /reply:\s*`HX2 BrainShell\(\$\{[^}]+\}\)\s*ONLINE\.\s*Received:\s*\$\{message\}`/g;

let replaced = false;
if (echo1.test(out)) { out = out.replace(echo1, "reply: await callOpenAIChat(message)"); replaced = true; }
if (!replaced && echo2.test(out)) { out = out.replace(echo2, "reply: await callOpenAIChat(message)"); replaced = true; }

if (!replaced) {
  // Fallback: replace a common JSON shape that contains Received:
  const received = /`HX2 BrainShell\([^)]*\)\s*ONLINE\.\s*Received:\s*\$\{message\}`/g;
  if (!received.test(out)) {
    throw new Error("Could not find echo template string. Need to inspect /brain/chat handler code around reply generation.");
  }
  out = out.replace(received, "${await callOpenAIChat(message)}");
}

// 4) Backup + write
const bak = target + ".bak_" + Date.now();
fs.writeFileSync(bak, src, "utf8");
fs.writeFileSync(target, out, "utf8");

console.log("OK patched:", target);
console.log("Backup:", bak);

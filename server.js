import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

function getTextFromResponsesApi(resp) {
  // Prefer output_text if present (Responses API convenience)
  if (typeof resp?.output_text === "string" && resp.output_text.trim()) return resp.output_text.trim();

  // Otherwise, walk output[].content[].text
  const out = resp?.output;
  if (Array.isArray(out)) {
    const parts = [];
    for (const item of out) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          const t = c?.text;
          if (typeof t === "string" && t) parts.push(t);
        }
      }
    }
    const joined = parts.join("").trim();
    if (joined) return joined;
  }
  return null;
}

async function callOpenAI(userText) {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing in environment");

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const body = {
    model,
    input: [
      { role: "system", content: "You are HX2 Brain. Be helpful and concise. Do not echo the user." },
      { role: "user", content: String(userText ?? "") }
    ]
  };

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("OpenAI error: " + JSON.stringify(j).slice(0, 500));

  return getTextFromResponsesApi(j) || "OK";
}

app.get("/brain/status", (_req, res) => {
  res.json({
    ok: true,
    service: "hx2-brain-shell",
    brain_attached: true,
    brain_version: "hx2-brain-shell-v0.2-openai",
    mode: "SAFE"
  });
});

app.post("/brain/chat", async (req, res) => {
  try {
    const message =
      req?.body?.message ??
      req?.body?.text ??
      req?.body?.input ??
      req?.body?.prompt ??
      req?.body?.content ??
      "";

    const reply = await callOpenAI(message);

    res.json({
      ok: true,
      reply,
      brain_attached: true,
      brain_version: "hx2-brain-shell-v0.2-openai",
      mode: "SAFE"
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: String(e?.message || e),
      brain_version: "hx2-brain-shell-v0.2-openai",
      mode: "SAFE"
    });
  }
});

const port = Number(process.env.PORT || 3805);
app.listen(port, "127.0.0.1", () => {
  console.log(`brain-shell listening on 127.0.0.1:${port}`);
});

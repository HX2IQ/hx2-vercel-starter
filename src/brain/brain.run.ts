export async function brainRun(payload: {
  input: string;
  mode?: "SAFE" | "OWNER";
}) {
  const mode = payload?.mode ?? "SAFE";

  if (mode !== "SAFE") {
    return { ok: false, error: "Only SAFE mode allowed" };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { ok: false, error: "OPENAI_API_KEY not set" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are HX2 running in SAFE mode. Be concise and factual."
        },
        {
          role: "user",
          content: String(payload.input || "")
        }
      ]
    })
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim() ?? null;

  return {
    ok: true,
    mode: "SAFE",
    reply,
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    timestamp: new Date().toISOString()
  };
}
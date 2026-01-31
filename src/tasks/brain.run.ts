export async function run(task: any) {
  const mode = task?.payload?.mode ?? task?.mode ?? "SAFE";
  if (mode !== "SAFE") return { ok: false, error: "Only SAFE mode allowed" };

  // Support both payload shapes:
  // 1) payload.body.input (your enqueue example)
  // 2) payload.input
  const input =
    task?.payload?.body?.input ??
    task?.payload?.input ??
    task?.payload?.body?.message ??
    task?.payload?.message ??
    "";

  const res = await fetch("https://optinodeiq.com/api/brain/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input: String(input || "") }),
  });

  const text = await res.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { data = text; }

  return {
    ok: res.ok,
    httpStatus: res.status,
    data
  };
}
import type { AP2RequestBody, AP2Response } from "@/lib/ap2/types";

/**
 * Minimal router so the system compiles and returns JSON.
 * You can expand handlers later.
 */
export async function routeTask(body: AP2RequestBody): Promise<AP2Response> {
  const cmd = (body.command || body.task || "").toString();

  if (!cmd) return { ok: false, error: "Missing command/task" };

  if (cmd === "ping") return { ok: true, result: { status: "ok", pong: true, mode: body.mode ?? "SAFE" } };

  // stub: you can add real handlers here
  return { ok: false, error: "Unknown command (router)", command: cmd };
}
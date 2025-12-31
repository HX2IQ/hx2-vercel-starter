import type { AP2RequestBody, AP2Response } from "./ap2/types";

/**
 * Compile-safe queue stub.
 * Supports both:
 *  - enqueueTask(taskType, payload)
 *  - enqueueTask(body)
 */
export async function enqueueTask(taskType: string, payload?: any): Promise<AP2Response>;
export async function enqueueTask(body: AP2RequestBody): Promise<AP2Response>;
export async function enqueueTask(a: any, b?: any): Promise<AP2Response> {
  const isBody = typeof a === "object" && a !== null && ("task" in a || "command" in a);

  const task = isBody
    ? (a as AP2RequestBody)
    : ({ task: String(a), payload: b ?? {} } as any);

  return {
    ok: true,
    status: "ENQUEUED",
    data: {
      note: "Stub enqueueTask: no persistence yet",
      received: task
    }
  };
}

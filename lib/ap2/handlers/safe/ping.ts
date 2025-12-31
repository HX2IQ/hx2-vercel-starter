import type { AP2RequestBody } from "@/lib/ap2/types";

export async function ping(body: AP2RequestBody) {
  return {
    ok: true,
    executed: "ping",
    message: "AP2 executed task: ping",
  };
}






























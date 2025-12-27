import type { AP2RequestBody } from "../../taskRouter";

export async function ping(body: AP2RequestBody) {
  return {
    ok: true,
    executed: "ping",
    message: "AP2 executed task: ping",
  };
}

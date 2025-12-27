export type Ap2Request = {
  command: string;
  mode?: string;
  detail?: string;
  constraints?: Record<string, any>;
  [k: string]: any;
};

type Handler = (req: Ap2Request) => any | Promise<any>;

const handlers: Record<string, Handler> = {};

// Built-ins
handlers["__router_id__"] = () => ({
  ok: true,
  router: "ap2-real-router-v1",
  commands: Object.keys(handlers).sort()
});

handlers["ping"] = (req) => ({
  ok: true,
  mode: req.mode ?? "SAFE",
  executed: "ping",
  message: "AP2 ping ok (real router)"
});

handlers["whoami"] = () => ({
  ok: true,
  whoami: "vercel-runtime",
  note: "This is AP2 router identity (not OS-level user)."
});

// Main entry
export async function handleAp2Command(req: Ap2Request) {
  const cmd = (req?.command ?? "").trim();
  const h = handlers[cmd];
  if (!h) return { ok: false, error: "Unknown command (real router)", command: cmd };
  return await h(req);
}

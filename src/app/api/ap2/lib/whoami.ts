export function handleWhoAmI(ctx: any) {
  return {
    ok: true,
    command: "whoami",
    identity: {
      node: "ap2",
      mode: ctx?.mode ?? "SAFE",
      brainAttached: false,
      environment: process.env.VERCEL ? "vercel" : "local",
    },
    note: "AP2 identity handler"
  };
}

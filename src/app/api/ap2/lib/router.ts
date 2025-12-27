export async function handleCommand(payload: any) {
  const cmd = payload?.command

  if (!cmd) {
    return { ok: false, error: "No command provided" }
  }

  switch (cmd) {
    case "ping":
      return { ok: true, result: "pong" }

    case "whoami":
      return {
        ok: true,
        result: {
          runtime: "vercel",
          handler: "ap2",
          node: "hx2"
        }
      }

    default:
      return {
        ok: false,
        error: "Unknown command (real router)",
        command: cmd
      }
  }
}

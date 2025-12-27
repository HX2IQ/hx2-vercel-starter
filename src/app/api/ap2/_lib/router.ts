export type Ap2CommandContext = {
  command: string
  mode?: string
  constraints?: Record<string, any>
}

export async function runAp2Command(ctx: Ap2CommandContext) {
  switch (ctx.command) {
    case "ping":
      return {
        ok: true,
        command: "ping",
        result: {
          message: "AP2 online",
          timestamp: new Date().toISOString(),
          mode: ctx.mode ?? "SAFE"
        }
      }

    default:
      return {
        ok: false,
        error: `Unknown command: ${ctx.command}`,
        command: ctx.command
      }
  }
}

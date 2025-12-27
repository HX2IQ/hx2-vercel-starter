export type AP2CommandResult = {
  ok: boolean
  command: string
  result?: any
  error?: string
}

import { ping } from "./ping"
import { whoami } from "./whoami"

export async function routeCommand(command: string): Promise<AP2CommandResult> {
  switch (command) {
    case "ping":
      return ping()
    case "whoami":
      return whoami()
    default:
      return {
        ok: false,
        command,
        error: "Unknown command"
      }
  }
}

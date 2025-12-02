import { AP2Request, AP2Response } from "./types";

export async function handleAP2(request: AP2Request): Promise<AP2Response> {
  const { command, payload } = request;

  switch (command) {
    case "ping":
      return {
        ok: true,
        message: "AP2 is installed and responding (ping)."
      };

    case "generateSystemReportEndpoint":
      return {
        ok: true,
        message: "System report endpoint already installed.",
      };

    default:
      return {
        ok: false,
        message: "Unknown command",
        error: `Command '${command}' is not implemented yet.`
      };
  }
}

import type { HX2Body } from './types';
import { handlePing } from "./handlers/ping";
import { handleScaffoldExecute } from "./handlers/scaffold_execute";

export function commandRouter(type: string, body: HX2Body) {
  switch (type) {
    case "ping":
      return handlePing(body);

    case "scaffold.execute":
      return handleScaffoldExecute(body);

    default:
      return { ok: false, error: `Unknown command: ${type}` };
  }
}






















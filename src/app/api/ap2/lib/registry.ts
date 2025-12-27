import { pingHandler } from "./ping";

export const commandRegistry: Record<string, Function> = {
  ping: pingHandler
};

export type HX2Body = {
  command?: string;
  mode?: string;
  scope?: any;
  detail?: any;
  constraints?: Record<string, any>;
  [k: string]: any;
};

export type RouteResult = {
  ok: boolean;
  error?: string;
  command?: string | null;
  result?: any;
};

/**
 * Compile-safe stub router.
 * Replace with real routing once the build is green.
 */
export async function routeCommand(body: HX2Body): Promise<RouteResult> {
  const cmd = body?.command ?? null;
  return {
    ok: false,
    error: "Unknown command (stub router)",
    command: cmd,
  };
}

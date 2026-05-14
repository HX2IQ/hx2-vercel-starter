export type BrainProvider = "openai" | "anthropic" | "google";

export function getPreferredProvider(): BrainProvider {
  return (process.env.HX2_BRAIN_PROVIDER as BrainProvider) || "openai";
}

export function listProviders(): BrainProvider[] {
  return ["openai","anthropic","google"];
}

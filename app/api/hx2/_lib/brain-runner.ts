import { getPreferredProvider } from "./brain-provider";

export async function runBrain(prompt: string) {
  const provider = getPreferredProvider();

  return {
    ok: true,
    provider,
    answer: "Stub response from " + provider + ". Replace with real provider call."
  };
}

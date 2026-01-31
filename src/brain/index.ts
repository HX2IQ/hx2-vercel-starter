export type BrainMode = "SAFE" | "OWNER";

export interface BrainInput {
  input: string;
  mode?: BrainMode;
  meta?: Record<string, any>;
}

export interface BrainOutput {
  ok: boolean;
  mode: BrainMode;
  reply: string | null;
  model?: string;
  timestamp?: string;
  error?: string;
}
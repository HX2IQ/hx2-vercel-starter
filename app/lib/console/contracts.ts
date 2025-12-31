export type HX2Body = {
  command: string;
  mode?: "SAFE" | "OWNER";
  payload?: any;
};

export type HX2Result = {
  ok: boolean;
  data?: any;
  error?: string;
};












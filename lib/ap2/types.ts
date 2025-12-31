export type AP2Mode = "SAFE" | "OWNER";
export type AnyJson = null | boolean | number | string | AnyJson[] | { [k: string]: AnyJson };
export type HX2Mode = "SAFE" | "OWNER";

export interface HX2Body {
  command?: string;
  task?: string;
  mode?: HX2Mode | string;
  detail?: "SUMMARY" | "FULL" | string;
  scope?: string[];
  constraints?: Record<string, any>;
  comment?: string;
  [k: string]: any;
}

export interface AP2Task {
  id?: string;
  type?: string;
  payload?: any;
  createdAt?: string;
  [k: string]: any;
}

export interface AP2RequestBody extends HX2Body {}

export type AP2Request = AP2RequestBody;

export interface AP2Response {
  ok: boolean;
  status?: string;
  message?: string;
  data?: any;
  error?: string;
  [k: string]: any;
}



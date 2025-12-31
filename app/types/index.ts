export type AP2RequestBody = {
  task?: string;
  node?: string;
  blueprint_name?: string;
  type?: string;
  body?: any;
  [key: string]: any;
};

export type AP2Result = {
  ok: boolean;
  error?: string;
  [key: string]: any;
};

export type HX2Body = AP2RequestBody;










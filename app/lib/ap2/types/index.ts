export type AP2RequestBody = {
  task?: {
    node?: string;
    blueprint_name?: string;
  };
  [key: string]: any;
};

export type AP2Result = {
  ok: boolean;
  error?: string;
  [key: string]: any;
};














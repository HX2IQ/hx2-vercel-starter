export interface AP2Request {
  command: string;
  payload?: any;
}

export interface AP2Response {
  ok: boolean;
  message?: string;
  data?: any;
  error?: string;
}

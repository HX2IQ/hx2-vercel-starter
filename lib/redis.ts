export type RedisLike = {
  lpush?: (...args: any[]) => Promise<any> | any;
  brpop?: (...args: any[]) => Promise<any> | any;
  set?: (...args: any[]) => Promise<any> | any;
  get?: (...args: any[]) => Promise<any> | any;
};
export const redis: RedisLike = {
  async lpush() { return null; },
  async brpop() { return null; },
  async set() { return null; },
  async get() { return null; },
};

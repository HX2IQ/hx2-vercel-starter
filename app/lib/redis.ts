export type RedisRawResp = { ok: boolean; status: number; json: any };

function trim(v?: string) { return (v || "").trim(); }
function stripSlash(v: string) { return v.replace(/\/+$/, ""); }

function readEnv() {
  const url = stripSlash(trim(process.env.UPSTASH_REDIS_REST_URL));
  const token = trim(process.env.UPSTASH_REDIS_REST_TOKEN);
  return { url, token, ok: !!url && !!token };
}

function noopRedis() {
  const raw = async (_path: string): Promise<RedisRawResp> => ({
    ok: false,
    status: 503,
    json: { ok: false, error: "redis_not_configured" }
  });

  return {
    raw,
    get: async (_key: string) => null as any,
    set: async (_key: string, _value: string, _opts?: { ex?: number }) => false,
    getJson: async (_key: string) => null as any,
    setJson: async (_key: string, _value: any, _opts?: { ex?: number }) => false,
    sadd: async (_key: string, _member: string) => null as any,
    scard: async (_key: string) => null as any,
  };
}

export function getRedis() {
  const env = readEnv();
  if (!env.ok) return noopRedis();

  const request = async (path: string): Promise<RedisRawResp> => {
    const res = await fetch(`${env.url}${path}`, {
      headers: { Authorization: `Bearer ${env.token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  };

  return {
    raw: request,

    async get(key: string) {
      const r = await request(`/get/${encodeURIComponent(key)}`);
      if (!r.ok) return null;
      return r.json?.result ?? null;
    },

    async set(key: string, value: string, opts?: { ex?: number }) {
      const ex = opts?.ex;
      const suffix = (typeof ex === "number" && ex > 0) ? `?EX=${Math.floor(ex)}` : "";
      const payload = value ?? "";
      const r = await request(`/set/${encodeURIComponent(key)}/${encodeURIComponent(payload)}${suffix}`);
      return r.ok;
    },

    async getJson(key: string) {
      const raw = await this.get(key);
      if (raw === null || raw === undefined || raw === "") return null;
      if (typeof raw !== "string") return raw;
      try { return JSON.parse(raw); } catch { return raw; }
    },

    async setJson(key: string, value: any, opts?: { ex?: number }) {
      const payload = (typeof value === "string") ? value : JSON.stringify(value);
      return this.set(key, payload, opts);
    },

    async sadd(key: string, member: string) {
      const r = await request(`/sadd/${encodeURIComponent(key)}/${encodeURIComponent(member)}`);
      return r.ok ? (r.json?.result ?? 0) : null;
    },

    async scard(key: string) {
      const r = await request(`/scard/${encodeURIComponent(key)}`);
      return r.ok ? (r.json?.result ?? 0) : null;
    },
  };
}

/** Convenience exports used by some routes */
export async function redisGetJson(key: string) {
  return getRedis().getJson(key);
}
export async function redisSetJson(key: string, value: any, opts?: { ex?: number }) {
  return getRedis().setJson(key, value, opts);
}
export async function redisSAdd(key: string, member: string) {
  return getRedis().sadd(key, member);
}
export async function redisSCard(key: string) {
  return getRedis().scard(key);
}

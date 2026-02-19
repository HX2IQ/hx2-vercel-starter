import { Redis } from "@upstash/redis";

export type TaskState = "ENQUEUED" | "RUNNING" | "DONE" | "FAILED" | "UNKNOWN";

export type TaskRecord = {
  taskId: string;
  taskType: string;
  payload: any;
  state: TaskState;
  createdAt: string;
  updatedAt: string;
  note?: string;
  result?: any;
  error?: any;
};

const mem = new Map<string, TaskRecord>();

function nowIso() { return new Date().toISOString(); }

function makeId(prefix = "ap2t") {
  const rnd = Math.random().toString(16).slice(2);
  const ts  = Date.now().toString(16);
  return `${prefix}_${ts}_${rnd}`;
}

function hasUpstashEnv() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis(): Redis | null {
  try {
    if (!hasUpstashEnv()) return null;
    return Redis.fromEnv();
  } catch {
    return null;
  }
}

function key(taskId: string) { return `ap2:task:${taskId}`; }

export async function createTask(taskType: string, payload: any = {}, note?: string): Promise<TaskRecord> {
  const taskId = makeId();
  const t: TaskRecord = {
    taskId,
    taskType: String(taskType || "unknown"),
    payload: payload ?? {},
    state: "ENQUEUED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    note
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(key(taskId), JSON.stringify(t));
    await redis.lpush("ap2:queue", taskId);
    return t;
  }

  mem.set(taskId, t);
  return t;
}

export async function getTask(taskId: string): Promise<TaskRecord | null> {
  if (!taskId) return null;

  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(key(taskId));
    if (!raw) return null;
    try { return JSON.parse(raw) as TaskRecord; } catch { return null; }
  }

  return mem.get(taskId) ?? null;
}
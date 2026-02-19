import { Redis } from "@upstash/redis";

export type Ap2TaskState = "ENQUEUED" | "RUNNING" | "DONE" | "FAILED";

export type Ap2Task = {
  taskId: string;
  taskType: string;
  payload: any;
  state: Ap2TaskState;
  createdAt: string;
  updatedAt: string;
  note?: string;
};

const redis = Redis.fromEnv();

/**
 * Primary + legacy key support (stop-the-bleeding).
 * We write ALL, and read in order until found.
 */
const keyPrimary = (taskId: string) => `ap2:task:${taskId}`;
const keyLegacy1 = (taskId: string) => `hx2:task:${taskId}`;   // legacy guess
const keyLegacy2 = (taskId: string) => `ap2:tasks:${taskId}`;  // legacy guess
const queueKey   = () => `ap2:queue`;

export function newTaskId() {
  return `ap2t_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
}

async function writeAllKeys(task: Ap2Task) {
  await redis.set(keyPrimary(task.taskId), task);
  await redis.set(keyLegacy1(task.taskId), task);
  await redis.set(keyLegacy2(task.taskId), task);
}

export async function createTask(taskType: string, payload: any, note?: string) {
  const taskId = newTaskId();
  const now = new Date().toISOString();

  const task: Ap2Task = {
    taskId,
    taskType,
    payload: payload ?? {},
    state: "ENQUEUED",
    createdAt: now,
    updatedAt: now,
    note
  };

  await writeAllKeys(task);
  await redis.lpush(queueKey(), taskId);

  return task;
}

export async function getTask(taskId: string) {
  if (!taskId) return null;

  // Try primary then legacy
  const t1 = await redis.get<Ap2Task>(keyPrimary(taskId));
  if (t1) return t1;

  const t2 = await redis.get<Ap2Task>(keyLegacy1(taskId));
  if (t2) return t2;

  const t3 = await redis.get<Ap2Task>(keyLegacy2(taskId));
  if (t3) return t3;

  return null;
}

export async function touchTask(taskId: string, patch: Partial<Ap2Task>) {
  const cur = await getTask(taskId);
  if (!cur) return null;

  const next: Ap2Task = {
    ...cur,
    ...patch,
    updatedAt: new Date().toISOString()
  };

  await writeAllKeys(next);
  return next;
}
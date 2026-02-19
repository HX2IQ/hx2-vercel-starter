import { kv } from "@vercel/kv";

export type AP2TaskState = "ENQUEUED" | "RUNNING" | "DONE" | "FAILED";

export async function createTask(taskType: string, payload: any) {
  const id = `ap2:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const task = {
    taskId: id,
    taskType,
    payload,
    state: "ENQUEUED" as AP2TaskState,
    createdAt: new Date().toISOString(),
  };
  await kv.set(id, task);
  return task;
}

export async function getTask(taskId: string) {
  return await kv.get(taskId);
}

export async function updateTask(taskId: string, patch: Partial<any>) {
  const cur: any = await kv.get(taskId);
  if (!cur) return null;
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  await kv.set(taskId, next);
  return next;
}
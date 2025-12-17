import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function enqueueTask(type: string, payload: any) {
  const task = await prisma.ap2Task.create({
    data: {
      taskType: type,
      payload,
      state: "queued",
    },
  });

  // enqueue for AP2 worker
  await redis.lpush("ap2:queue", task.id);

  return task;
}

export async function listTasks(state?: string) {
  return prisma.ap2Task.findMany({
    where: state ? { state } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function getTask(id: string) {
  return prisma.ap2Task.findUnique({ where: { id } });
}

export async function updateTask(id: string, update: any) {
  return prisma.ap2Task.update({
    where: { id },
    data: update,
  });
}

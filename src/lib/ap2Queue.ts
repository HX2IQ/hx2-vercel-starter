import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis"; // MUST exist in HX2

export async function enqueueTask(type: string, payload: any) {
  // 1. Create canonical DB record
  const task = await prisma.ap2Task.create({
    data: {
      taskType: type,
      payload,
      state: "queued",
    },
  });

  // 2. Enqueue task ID into Redis
  await redis.lpush("ap2:queue", task.id);

  return task;
}

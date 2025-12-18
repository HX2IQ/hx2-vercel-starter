import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function enqueueTask(taskType: string, payload: any) {
  // 1. Create task in DB
  const task = await prisma.ap2Task.create({
    data: {
      taskType,
      payload,
      state: "queued",
    },
  });

  // 2. Push full task object to Redis
  await redis.lpush(
    "ap2:queue",
    JSON.stringify({
      id: task.id,
      taskType: task.taskType,
      payload: task.payload,
      callbackUrl: `${process.env.BASE_URL}/api/ap2/tasks/${task.id}/complete`,
    })
  );

  return task;
}

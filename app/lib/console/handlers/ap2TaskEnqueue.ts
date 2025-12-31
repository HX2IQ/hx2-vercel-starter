export async function handleAp2TaskEnqueue(task: any) {
  const taskId = "local_" + Date.now();
  return {
    ok: true,
    executed: "ap2.task.enqueue",
    message: "Task enqueued (local stub)",
    data: { task_id: taskId, task: task?.task ?? null },
  };
}












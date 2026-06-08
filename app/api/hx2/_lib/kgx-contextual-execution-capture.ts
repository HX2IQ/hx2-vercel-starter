import { prisma } from "./kgx-lite";

export async function writeKgxContextualExecution(
  payload: {
    request: string;
    context_tags: string[];
    pipeline: any[];
    score?: number;
    success?: boolean;
  }
) {

  const memory =
    await prisma.memoryRecord.create({
      data: {
        memoryType: "kgx_contextual_execution",
        memoryKey: `context_execution_${Date.now()}`,
        payload
      }
    });

  return {
    contextual_execution_capture_active: true,
    memory
  };
}

import { prisma } from "./kgx-lite";
import { buildKgxReinforcementConsumption } from "./kgx-reinforcement-consumption";

export async function persistKgxReinforcementMemory() {
  const consumption = await buildKgxReinforcementConsumption();

  const memory = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_reinforcement_weights",
      memoryKey: `reinforcement_weights_${Date.now()}`,
      payload: {
        routing_mutation_mode: consumption.routing_mutation_mode,
        weights: consumption.weights,
        createdBy: "kgx_phase_5e_reinforcement_memory_persistence"
      }
    }
  });

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_reinforcement_weights_persisted",
      eventSource: "api/hx2/kgx-reinforcement-persist",
      payload: {
        memory_id: memory.id,
        weight_count: Object.keys(consumption.weights || {}).length
      }
    }
  });

  return {
    reinforcement_memory_persistence_active: true,
    memory,
    audit
  };
}

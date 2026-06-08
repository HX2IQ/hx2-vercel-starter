import { prisma } from "./kgx-lite";
import { buildKgxReinforcementConsumption } from "./kgx-reinforcement-consumption";

function roundWeight(value: number) {
  return Math.round(value * 100) / 100;
}

function mergeWeights(
  current: Record<string, number>,
  incoming: Record<string, number>
) {
  const merged: Record<string, number> = {};
  const nodes = new Set([
    ...Object.keys(current || {}),
    ...Object.keys(incoming || {})
  ]);

  for (const node of nodes) {
    const oldWeight = Number(current[node] || 1);
    const newWeight = Number(incoming[node] || oldWeight);

    merged[node] = roundWeight(
      oldWeight * 0.7 + newWeight * 0.3
    );
  }

  return merged;
}

export async function consolidateKgxReinforcementState() {
  const latest = await prisma.memoryRecord.findFirst({
    where: { memoryType: "kgx_reinforcement_state" },
    orderBy: { createdAt: "desc" }
  });

  const consumption = await buildKgxReinforcementConsumption();

  const currentWeights =
    (latest?.payload as any)?.weights || {};

  const incomingWeights =
    consumption.weights || {};

  const mergedWeights =
    mergeWeights(currentWeights, incomingWeights);

  const snapshot = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_reinforcement_snapshot",
      memoryKey: `reinforcement_snapshot_${Date.now()}`,
      payload: {
        previous_state_id: latest?.id || null,
        previous_weights: currentWeights,
        incoming_weights: incomingWeights,
        merged_weights: mergedWeights,
        routing_mutation_mode: consumption.routing_mutation_mode,
        createdBy: "kgx_phase_5i_5l_reinforcement_bundle"
      }
    }
  });

  const state = await prisma.memoryRecord.create({
    data: {
      memoryType: "kgx_reinforcement_state",
      memoryKey: `reinforcement_state_${Date.now()}`,
      payload: {
        weights: mergedWeights,
        source: "consolidated_reinforcement_state",
        snapshot_id: snapshot.id,
        routing_mutation_mode: consumption.routing_mutation_mode,
        createdBy: "kgx_phase_5i_5l_reinforcement_bundle"
      }
    }
  });

  const audit = await prisma.auditEvent.create({
    data: {
      eventType: "kgx_reinforcement_state_consolidated",
      eventSource: "api/hx2/kgx-reinforcement-consolidate",
      payload: {
        state_id: state.id,
        snapshot_id: snapshot.id,
        weight_count: Object.keys(mergedWeights).length
      }
    }
  });

  return {
    reinforcement_consolidation_active: true,
    reinforcement_merge_active: true,
    reinforcement_snapshot_active: true,
    state,
    snapshot,
    audit,
    weights: mergedWeights
  };
}

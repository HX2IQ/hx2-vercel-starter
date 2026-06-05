import { prisma } from "./kgx-lite";

export type KgxContextItem = {
  type: string;
  id: string;
  score: number;
  reason: string;
  payload: any;
};

function textMatchScore(query: string, value: string): number {
  const q = query.toLowerCase();
  const v = value.toLowerCase();

  if (!q || !v) return 0;
  if (v.includes(q)) return 5;

  const terms = q.split(/\s+/).filter(Boolean);
  return terms.reduce((score, term) => {
    return v.includes(term) ? score + 1 : score;
  }, 0);
}

export async function buildKgxGraphContext(query: string) {
  const memories = await prisma.memoryRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const plans = await prisma.capabilityPlan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const executions = await prisma.executionEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { node: true }
  });

  const relationships = await prisma.kgxRelationship.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const nodes = await prisma.node.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const ranked: KgxContextItem[] = [];

  for (const memory of memories) {
    const blob = JSON.stringify(memory);
    const score = textMatchScore(query, blob) + 3;

    if (score > 3) {
      ranked.push({
        type: "MemoryRecord",
        id: memory.id,
        score,
        reason: "memory match",
        payload: memory
      });
    }
  }

  for (const plan of plans) {
    const blob = JSON.stringify(plan);
    const score = textMatchScore(query, blob) + 3;

    if (score > 3) {
      ranked.push({
        type: "CapabilityPlan",
        id: plan.id,
        score,
        reason: "plan match",
        payload: plan
      });
    }
  }

  for (const execution of executions) {
    const blob = JSON.stringify(execution);
    const score = textMatchScore(query, blob) + 2;

    if (score > 2) {
      ranked.push({
        type: "ExecutionEvent",
        id: execution.id,
        score,
        reason: "execution match",
        payload: execution
      });
    }
  }

  for (const relationship of relationships) {
    const blob = JSON.stringify(relationship);
    const score = textMatchScore(query, blob) + 2;

    if (score > 2) {
      ranked.push({
        type: "KgxRelationship",
        id: relationship.id,
        score,
        reason: "relationship match",
        payload: relationship
      });
    }
  }

  for (const node of nodes) {
    const blob = JSON.stringify(node);
    const score = textMatchScore(query, blob) + 5;

    if (score > 5) {
      ranked.push({
        type: "Node",
        id: node.id,
        score,
        reason: "node match",
        payload: node
      });
    }
  }

  const top = ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    query,
    summary: {
      ranked_items: top.length,
      related_nodes: nodes.map(x => x.nodeKey),
      memory_count: memories.length,
      plan_count: plans.length,
      execution_count: executions.length,
      relationship_count: relationships.length
    },
    ranked_context: top,
    raw_counts: {
      memories: memories.length,
      plans: plans.length,
      executions: executions.length,
      relationships: relationships.length,
      nodes: nodes.length
    }
  };
}

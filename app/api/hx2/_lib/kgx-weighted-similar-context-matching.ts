import { buildKgxSimilarContextCombinationMatching } from "./kgx-similar-context-combination-matching";
import { buildKgxWeightedContextSimilarityLearning } from "./kgx-weighted-context-similarity-learning";
import { buildKgxContextTags } from "./kgx-context-tags";

function weightMap(weights: any[]) {
  const map: Record<string, number> = {};

  for (const item of weights || []) {
    map[item.tag] = Number(item.predictive_weight || 1);
  }

  return map;
}

function weightedSimilarity(
  requestTags: string[],
  comboTags: string[],
  weights: Record<string, number>
) {
  const requestSet = new Set(requestTags);
  const comboSet = new Set(comboTags);

  let overlapWeight = 0;
  let totalWeight = 0;

  for (const tag of new Set([...requestTags, ...comboTags])) {
    const weight = weights[tag] || 1;
    totalWeight += weight;

    if (requestSet.has(tag) && comboSet.has(tag)) {
      overlapWeight += weight;
    }
  }

  return totalWeight > 0
    ? overlapWeight / totalWeight
    : 0;
}

export async function buildKgxWeightedSimilarContextMatching(
  requestText: string
) {
  const context = buildKgxContextTags(requestText);
  const baseMatching =
    await buildKgxSimilarContextCombinationMatching(requestText);
  const weightLearning =
    await buildKgxWeightedContextSimilarityLearning();

  const weights =
    weightMap(weightLearning.weights || []);

  const requestTags =
    [...(context.tags || [])].sort();

  const matches =
    (baseMatching.matches || [])
      .map((x: any) => {
        const comboTags =
          String(x.context_combination || "")
            .split("+")
            .filter(Boolean);

        const weightedScore =
          weightedSimilarity(
            requestTags,
            comboTags,
            weights
          );

        return {
          ...x,
          weighted_similarity_score:
            Math.round(weightedScore * 100) / 100
        };
      })
      .filter((x: any) => x.weighted_similarity_score > 0)
      .sort(
        (a: any, b: any) =>
          b.weighted_similarity_score -
          a.weighted_similarity_score
      );

  return {
    weighted_similar_context_matching_active: true,
    request: requestText,
    request_tags: requestTags,
    learned_weights: weights,
    matches
  };
}

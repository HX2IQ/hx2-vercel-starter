import { buildKgxContextTagCombinationLearning } from "./kgx-context-tag-combination-learning";
import { buildKgxContextTags } from "./kgx-context-tags";

function overlapScore(a: string[], b: string[]) {
  const sa = new Set(a);
  const sb = new Set(b);

  let overlap = 0;

  for (const item of sa) {
    if (sb.has(item)) {
      overlap++;
    }
  }

  const maxSize =
    Math.max(sa.size, sb.size, 1);

  return overlap / maxSize;
}

export async function buildKgxSimilarContextCombinationMatching(
  requestText: string
) {
  const context = buildKgxContextTags(requestText);
  const learning =
    await buildKgxContextTagCombinationLearning();

  const requestTags =
    [...(context.tags || [])].sort();

  const matches =
    (learning.combinations || [])
      .map((x: any) => {
        const comboTags =
          String(x.context_combination || "")
            .split("+")
            .filter(Boolean);

        const similarity =
          overlapScore(
            requestTags,
            comboTags
          );

        return {
          ...x,
          similarity_score:
            Math.round(similarity * 100) / 100
        };
      })
      .filter((x: any) => x.similarity_score > 0)
      .sort(
        (a: any, b: any) =>
          b.similarity_score -
          a.similarity_score
      );

  return {
    similar_context_combination_matching_active: true,
    request: requestText,
    request_tags: requestTags,
    matches
  };
}

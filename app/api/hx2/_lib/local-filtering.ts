export type LocalFilterOptions<T = any> = {
  query: string;
  results: T[];
  minMatchScore: number;
  minQualityScore: number;
  minTokenOverlap?: number;
  getMatchScore?: (item: T) => number;
  getQualityScore?: (item: T) => number;
  getTokenOverlap?: (query: string, item: T) => number;
};

export function filterLocalResults<T = any>(options: LocalFilterOptions<T>): T[] {
  const {
    query,
    results,
    minMatchScore,
    minQualityScore,
    minTokenOverlap = 0,
    getMatchScore = (item: any) => Number(item?._score || 0),
    getQualityScore = (item: any) => Number(item?.quality_score || 0),
    getTokenOverlap,
  } = options;

  if (!Array.isArray(results)) return [];

  return results.filter((item: T) => {
    const matchScore = getMatchScore(item);
    const qualityScore = getQualityScore(item);

    if (matchScore < minMatchScore) return false;
    if (qualityScore < minQualityScore) return false;

    if (minTokenOverlap > 0) {
      if (!getTokenOverlap) return false;
      const overlap = getTokenOverlap(query, item);
      if (overlap < minTokenOverlap) return false;
    }

    return true;
  });
}

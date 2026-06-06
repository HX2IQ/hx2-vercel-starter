export function buildKgxNodePromotion(confidence: any) {
  const promoted =
    (confidence.adjusted || [])
      .filter((x: any) => x.adjusted_confidence >= 0.75)
      .map((x: any) => x.node);

  const demoted =
    (confidence.adjusted || [])
      .filter((x: any) => x.adjusted_confidence <= 0.25)
      .map((x: any) => x.node);

  return {
    node_promotion_active: true,
    promoted,
    demoted
  };
}

import { buildKgxPredictionRegimeIntelligence } from "./kgx-prediction-regime-intelligence";

export async function buildKgxPredictionRegimeAttribution() {
  const intelligence =
    await buildKgxPredictionRegimeIntelligence();

  const topRegime =
    intelligence.regimes?.[0] || null;

  const weakestRegime =
    intelligence.regimes?.length
      ? intelligence.regimes[intelligence.regimes.length - 1]
      : null;

  return {
    prediction_regime_attribution_active: true,
    top_regime: topRegime?.regime || null,
    top_regime_score: topRegime?.regime_score || 0,
    weakest_regime: weakestRegime?.regime || null,
    weakest_regime_score: weakestRegime?.regime_score || 0,
    regimes: intelligence.regimes
  };
}

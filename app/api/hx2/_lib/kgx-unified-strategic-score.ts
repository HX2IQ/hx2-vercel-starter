import { buildKgxExpectedValueIntelligence } from "./kgx-expected-value-intelligence";
import { buildKgxOutcomeForecastIntelligence } from "./kgx-outcome-forecast-intelligence";
import { buildKgxRiskScenarioIntelligence } from "./kgx-risk-scenario-intelligence";
import { buildKgxPredictionRegimeCalibration } from "./kgx-prediction-regime-calibration";

export async function buildKgxUnifiedStrategicScore() {
  const expectedValue =
    await buildKgxExpectedValueIntelligence();

  const forecast =
    await buildKgxOutcomeForecastIntelligence();

  const risk =
    await buildKgxRiskScenarioIntelligence();

  const regime =
    await buildKgxPredictionRegimeCalibration();

  const regimeMultiplier =
    regime.calibrations?.[0]?.calibration_multiplier || 1;

  const riskMultiplier =
    Math.max(0.25, (100 - risk.risk_score) / 100);

  const score =
    Math.round(
      expectedValue.expected_value *
      forecast.forecast_probability *
      regimeMultiplier *
      riskMultiplier
    );

  return {
    unified_strategic_score_active: true,
    expected_value: expectedValue.expected_value,
    forecast_probability: forecast.forecast_probability,
    risk_score: risk.risk_score,
    regime_multiplier: regimeMultiplier,
    unified_strategic_score: score
  };
}

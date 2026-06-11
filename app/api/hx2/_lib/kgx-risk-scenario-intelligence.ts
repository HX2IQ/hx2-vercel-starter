import { buildKgxOutcomeForecastIntelligence } from "./kgx-outcome-forecast-intelligence";

export async function buildKgxRiskScenarioIntelligence() {
  const forecast =
    await buildKgxOutcomeForecastIntelligence();

  const riskScore =
    Math.round((1 - forecast.forecast_probability) * 100);

  return {
    risk_scenario_intelligence_active: true,
    risk_score: riskScore,
    primary_risk:
      riskScore >= 50
        ? "execution_failure"
        : "minor_deviation",
    forecast_band: forecast.forecast_band
  };
}

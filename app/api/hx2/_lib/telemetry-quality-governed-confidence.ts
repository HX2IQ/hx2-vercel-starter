export function applyTelemetryQualityToConfidence(
  confidence: any,
  quality: any
) {
  const band =
    quality?.quality_band || "insufficient";

  const updated = {
    ...confidence,
    telemetry_quality_band: band,
    telemetry_quality_reason:
      quality?.quality_reason || "unknown"
  };

  if (band === "insufficient") {
    return {
      ...updated,
      confidence_band: "low",
      confidence_reason:
        "Telemetry quality is insufficient; defaulting to stability-first confidence.",
      quality_override: true
    };
  }

  if (band === "weak" && updated.confidence_band === "high") {
    return {
      ...updated,
      confidence_band: "medium",
      confidence_reason:
        "Telemetry quality is weak; reducing high confidence to medium.",
      quality_override: true
    };
  }

  return {
    ...updated,
    quality_override: false
  };
}

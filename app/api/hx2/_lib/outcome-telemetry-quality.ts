export type OutcomeTelemetryQuality = {
  quality_band: "insufficient" | "weak" | "usable" | "strong";
  record_count: number;
  quality_reason: string;
};

export function buildOutcomeTelemetryQuality(summary: any): OutcomeTelemetryQuality {
  const count = Number(summary?.record_count || 0);

  if (count < 3) {
    return {
      quality_band: "insufficient",
      record_count: count,
      quality_reason: "Not enough outcome records to support confident adaptation."
    };
  }

  if (count < 7) {
    return {
      quality_band: "weak",
      record_count: count,
      quality_reason: "Outcome telemetry exists but should be weighted cautiously."
    };
  }

  if (count < 15) {
    return {
      quality_band: "usable",
      record_count: count,
      quality_reason: "Outcome telemetry is usable for adaptive orchestration."
    };
  }

  return {
    quality_band: "strong",
    record_count: count,
    quality_reason: "Outcome telemetry has enough history for stronger adaptation."
  };
}

import fs from "fs";
import path from "path";

const weightsFile = path.join(
  process.cwd(),
  "tools",
  "orchestration-outcome",
  "data",
  "orchestration-learning-weights.json"
);

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

export function updateAdaptiveLearningWeights(
  learningRecord: any
) {

  let weights = {
    stability_bias: 1,
    expansion_bias: 1,
    verification_bias: 1,
    telemetry_bias: 1
  };

  try {

    if (fs.existsSync(weightsFile)) {

      weights = JSON.parse(
        fs.readFileSync(weightsFile, "utf8")
      );
    }

  } catch {}

  const alignment =
    learningRecord?.alignment || "partial";

  const weight =
    Number(learningRecord?.learning_weight || 0);

  if (alignment === "aligned") {

    weights.expansion_bias =
      clamp(
        weights.expansion_bias + 0.05,
        0.5,
        3
      );

    weights.telemetry_bias =
      clamp(
        weights.telemetry_bias + 0.03,
        0.5,
        3
      );
  }

  if (alignment === "misaligned") {

    weights.stability_bias =
      clamp(
        weights.stability_bias + 0.08,
        0.5,
        3
      );

    weights.verification_bias =
      clamp(
        weights.verification_bias + 0.06,
        0.5,
        3
      );

    weights.expansion_bias =
      clamp(
        weights.expansion_bias - 0.04,
        0.5,
        3
      );
  }

  if (weight < 0) {

    weights.telemetry_bias =
      clamp(
        weights.telemetry_bias - 0.03,
        0.5,
        3
      );
  }

  fs.mkdirSync(
    path.dirname(weightsFile),
    { recursive: true }
  );

  fs.writeFileSync(
    weightsFile,
    JSON.stringify(weights, null, 2),
    "utf8"
  );

  return weights;
}

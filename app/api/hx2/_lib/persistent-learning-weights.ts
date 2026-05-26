import fs from "fs";
import path from "path";

const weightsFile = path.join(
  process.cwd(),
  "tools",
  "orchestration-outcome",
  "data",
  "orchestration-learning-weights.json"
);

export function buildPersistentLearningWeights() {

  if (!fs.existsSync(weightsFile)) {

    const defaults = {
      stability_bias: 1,
      expansion_bias: 1,
      verification_bias: 1,
      telemetry_bias: 1
    };

    fs.mkdirSync(
      path.dirname(weightsFile),
      { recursive: true }
    );

    fs.writeFileSync(
      weightsFile,
      JSON.stringify(defaults, null, 2),
      "utf8"
    );

    return defaults;
  }

  try {
    return JSON.parse(
      fs.readFileSync(weightsFile, "utf8")
    );
  } catch {

    return {
      stability_bias: 1,
      expansion_bias: 1,
      verification_bias: 1,
      telemetry_bias: 1
    };
  }
}

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const weightsFile = path.join(
  process.cwd(),
  "tools",
  "orchestration-outcome",
  "data",
  "orchestration-learning-weights.json"
);

function readWeights() {
  const defaults = {
    stability_bias: 1,
    expansion_bias: 1,
    verification_bias: 1,
    telemetry_bias: 1
  };

  try {
    if (!fs.existsSync(weightsFile)) return defaults;
    return JSON.parse(fs.readFileSync(weightsFile, "utf8"));
  } catch {
    return defaults;
  }
}

export async function GET() {
  const weights = readWeights();

  return NextResponse.json({
    ok: true,
    weights,
    posture:
      Number(weights.stability_bias || 1) > Number(weights.expansion_bias || 1)
        ? "stability_weighted"
        : "expansion_weighted"
  });
}

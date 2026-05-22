import fs from "fs";
import path from "path";

const outcomeFile = path.join(
  process.cwd(),
  "tools",
  "orchestration-outcome",
  "data",
  "outcome-learning-records.jsonl"
);

export function buildOutcomeTelemetrySummary() {
  if (!fs.existsSync(outcomeFile)) {
    return {
      record_count: 0,
      alignment_counts: {},
      average_learning_weight: 0,
      latest_record: null
    };
  }

  const records = fs
    .readFileSync(outcomeFile, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const alignment_counts: Record<string, number> = {};
  let weightTotal = 0;

  for (const record of records) {
    const alignment = record?.alignment || "unknown";
    alignment_counts[alignment] = (alignment_counts[alignment] || 0) + 1;
    weightTotal += Number(record?.learning_weight || 0);
  }

  return {
    record_count: records.length,
    alignment_counts,
    average_learning_weight:
      records.length > 0
        ? Number((weightTotal / records.length).toFixed(2))
        : 0,
    latest_record: records[records.length - 1] || null
  };
}

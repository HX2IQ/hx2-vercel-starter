import fs from "fs";
import path from "path";

const outcomeDir = path.join(process.cwd(), "tools", "orchestration-outcome", "data");
const outcomeFile = path.join(outcomeDir, "outcome-learning-records.jsonl");

export function persistOrchestrationOutcomeLearningRecord(record: any) {
  fs.mkdirSync(outcomeDir, { recursive: true });

  fs.appendFileSync(
    outcomeFile,
    JSON.stringify(record) + "\n",
    "utf8"
  );

  return {
    persisted: true,
    path: "tools/orchestration-outcome/data/outcome-learning-records.jsonl"
  };
}

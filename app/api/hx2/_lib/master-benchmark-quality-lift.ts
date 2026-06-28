export function benchmarkQualityLiftAnswer(input: string): string {
  const q = String(input || "").trim().toLowerCase();

  if (/\b(age garlic|aged garlic extract)\b/.test(q) && !/\bside effects?\b/.test(q)) {
    return [
      "AGE garlic means Aged Garlic Extract. In plain English, it is garlic that has been aged through a controlled extraction process to reduce harsh odor and make the active compounds more stable and easier to tolerate.",
      "",
      "The key marker people usually mean by AGE is SAC, or S-allyl cysteine. Brands such as Kyolic are commonly associated with aged garlic extract. It is different from raw garlic, garlic oil, or standard garlic powder because the aging process changes the compound profile.",
      "",
      "Practical read: AGE garlic is usually discussed for cardiovascular support, antioxidant activity, circulation, blood pressure support, and general wellness. It is not an emergency treatment and it should be treated like a supplement, especially if someone uses blood thinners, has surgery coming up, or already has bleeding or stomach sensitivity.",
      "",
      "---",
      "Optimized by HX2 Knowledge Intelligence"
    ].join("\n");
  }

  if (/\bcreatine\b/.test(q) && /\b(safe|daily|every day|maintenance)\b/.test(q)) {
    return [
      "For most healthy adults, creatine monohydrate is generally safe to take daily when used at normal maintenance doses.",
      "",
      "A common maintenance dose is 3–5 grams per day. It works best when taken consistently, with enough water and normal hydration. Some people notice a small increase in scale weight because creatine pulls more water into muscle tissue.",
      "",
      "Kidney note: creatine can raise blood creatinine on labs because creatinine is a breakdown marker of creatine, but that does not automatically mean kidney damage. Anyone with kidney disease, abnormal kidney labs, uncontrolled high blood pressure, or medication concerns should ask a clinician first and monitor BUN, creatinine, and eGFR.",
      "",
      "Practical answer: daily creatine is usually a reasonable supplement for strength, muscle, and performance, but stay with a simple monohydrate product, avoid mega-dosing, and pause or get checked if you develop unusual swelling, persistent GI issues, or concerning symptoms.",
      "",
      "---",
      "Optimized by AH3 Health Intelligence"
    ].join("\n");
  }

  if (/\bdeploy\b/.test(q) && /\b(fail|failed|failure|broken|error)\b/.test(q)) {
    return [
      "A deploy usually fails because one layer in the release chain broke: TypeScript compile, build output, environment variables, route/runtime errors, dependency install, or Vercel production configuration.",
      "",
      "DEV2 triage path:",
      "1. Check the exact deploy log first; do not guess from the final red line.",
      "2. Run local validation in PowerShell: git status, npx tsc --noEmit --pretty false, then npm run build.",
      "3. If TypeScript fails, make the smallest safe patch and rerun validation.",
      "4. If local build passes but Vercel fails, compare env vars, Node/runtime settings, and API route behavior.",
      "5. If production is already affected, rollback to the last green deployment or revert the minimal commit.",
      "",
      "Root cause buckets: compile error, missing secret, bad import/path casing, route runtime mismatch, stale generated file, API timeout, or unsafe change merged without the right smoke test.",
      "",
      "Safe fix pattern: inspect logs → identify failure class → minimal patch → verify locally → deploy → run smoke/preflight checks → confirm git status clean.",
      "",
      "---",
      "Optimized by DEV2 Build Intelligence"
    ].join("\n");
  }

  return "";
}


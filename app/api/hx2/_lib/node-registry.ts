import type { Hx2NodeSpec } from "./node-spec";

export type Hx2RegistryEntry = {
  node_id: string;
  node_label: string;
  category: string;
  purpose: string;
  activation: Record<string, any>;
  safety: Record<string, any>;
  sources: string[];
  scoring_dimensions: string[];
};

export type RegistryPreviewResult = {
  ok: boolean;
  entry: Hx2RegistryEntry;
  warnings: string[];
  review_checklist: string[];
};

function clean(v: unknown): string {
  return String(v || "").trim();
}

function cleanArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => clean(x)).filter(Boolean);
}

export function buildRegistryEntry(spec: Hx2NodeSpec): Hx2RegistryEntry {
  return {
    node_id: clean(spec.node_id),
    node_label: clean(spec.node_label),
    category: clean(spec.ui?.category || "general"),
    purpose: clean(spec.purpose),
    activation: spec.activation || {},
    safety: spec.safety || {},
    sources: cleanArray(spec.sources),
    scoring_dimensions: cleanArray(spec.scoring_dimensions),
  };
}

export function previewRegistryEntry(spec: Hx2NodeSpec): RegistryPreviewResult {
  const entry = buildRegistryEntry(spec);
  const warnings: string[] = [];

  if (!entry.sources.length) warnings.push("registry entry has no sources");
  if (!entry.scoring_dimensions.length) warnings.push("registry entry has no scoring_dimensions");
  if (!entry.activation || Object.keys(entry.activation).length === 0) warnings.push("activation config is empty");
  if (!entry.safety || Object.keys(entry.safety).length === 0) warnings.push("safety config is empty");

  return {
    ok: true,
    entry,
    warnings,
    review_checklist: [
      "confirm node_id is unique",
      "confirm category placement is correct",
      "confirm activation flags are intentional",
      "confirm safety settings match owner expectations",
      "confirm sources and scoring dimensions are complete",
    ],
  };
}

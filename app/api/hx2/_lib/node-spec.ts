export type Hx2NodeSpec = {
  node_id: string;
  node_label: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  sources?: string[];
  scoring_dimensions?: string[];
  thresholds?: Record<string, number | string | boolean>;
  safety?: {
    mode?: "SAFE" | "OWNER" | "HYBRID";
    requires_review?: boolean;
    ip_firewall?: boolean;
  };
  activation?: {
    enabled?: boolean;
    dry_run_only?: boolean;
  };
  ui?: {
    display_name?: string;
    category?: string;
  };
  notes?: string;
};

export type NodeSpecValidationResult = {
  ok: boolean;
  valid: boolean;
  missing: string[];
  warnings: string[];
  normalized_spec: Hx2NodeSpec | null;
};

function cleanString(v: unknown): string {
  return String(v || "").trim();
}

function cleanStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => cleanString(x)).filter(Boolean);
}

export function normalizeNodeSpec(input: any): Hx2NodeSpec {
  const node_id = cleanString(input?.node_id).toLowerCase();
  const node_label = cleanString(input?.node_label);
  const purpose = cleanString(input?.purpose);

  return {
    node_id,
    node_label,
    purpose,
    inputs: cleanStringArray(input?.inputs),
    outputs: cleanStringArray(input?.outputs),
    sources: cleanStringArray(input?.sources),
    scoring_dimensions: cleanStringArray(input?.scoring_dimensions),
    thresholds: typeof input?.thresholds === "object" && input?.thresholds !== null ? input.thresholds : {},
    safety: {
      mode: ["SAFE", "OWNER", "HYBRID"].includes(String(input?.safety?.mode || "").trim())
        ? input.safety.mode
        : "SAFE",
      requires_review: Boolean(input?.safety?.requires_review ?? true),
      ip_firewall: Boolean(input?.safety?.ip_firewall ?? true),
    },
    activation: {
      enabled: Boolean(input?.activation?.enabled ?? false),
      dry_run_only: Boolean(input?.activation?.dry_run_only ?? true),
    },
    ui: {
      display_name: cleanString(input?.ui?.display_name || node_label),
      category: cleanString(input?.ui?.category || "general"),
    },
    notes: cleanString(input?.notes),
  };
}

export function validateNodeSpec(input: any): NodeSpecValidationResult {
  const spec = normalizeNodeSpec(input);

  const missing: string[] = [];
  const warnings: string[] = [];

  if (!spec.node_id) missing.push("node_id");
  if (!spec.node_label) missing.push("node_label");
  if (!spec.purpose) missing.push("purpose");
  if (!spec.inputs.length) missing.push("inputs");
  if (!spec.outputs.length) missing.push("outputs");

  if (spec.node_id && !/^[a-z0-9\-_]+$/.test(spec.node_id)) {
    warnings.push("node_id should use lowercase letters, numbers, hyphens, or underscores only");
  }

  if (spec.inputs.length > 12) {
    warnings.push("inputs list is large; consider simplifying v1 node contract");
  }

  if (spec.outputs.length > 12) {
    warnings.push("outputs list is large; consider simplifying v1 node contract");
  }

  if (!spec.sources?.length) {
    warnings.push("no sources defined");
  }

  if (!spec.scoring_dimensions?.length) {
    warnings.push("no scoring_dimensions defined");
  }

  return {
    ok: true,
    valid: missing.length === 0,
    missing,
    warnings,
    normalized_spec: spec,
  };
}

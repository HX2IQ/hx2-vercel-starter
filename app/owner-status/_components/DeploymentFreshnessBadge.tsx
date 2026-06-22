import type { CSSProperties } from "react";

type DeploymentStatusMinimal = {
  generated_at?: string;
  deployment?: {
    environment?: string;
    branch?: string;
    commit_short?: string;
    commit_message?: string;
    vercel_url?: string;
    region?: string;
  };
  checks?: {
    can_compare_live_sha_to_local_head?: boolean;
    exposes_brain_logic?: boolean;
    exposes_runtime_secrets?: boolean;
  };
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "18px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)"
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px"
};

const goodPillStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "999px",
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
  fontSize: "12px",
  fontWeight: 700
};

const warnPillStyle: CSSProperties = {
  ...goodPillStyle,
  background: "#fffbeb",
  border: "1px solid #fde68a",
  color: "#92400e"
};

const codeStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "8px",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: "13px",
  overflowWrap: "anywhere"
};

function safeValue(value: string | undefined) {
  return value && value.trim().length > 0 ? value : "unknown";
}

export function DeploymentFreshnessBadge({
  deploymentStatus
}: {
  deploymentStatus: DeploymentStatusMinimal | null;
}) {
  const deployment = deploymentStatus?.deployment;
  const checks = deploymentStatus?.checks;

  const environment = safeValue(deployment?.environment);
  const branch = safeValue(deployment?.branch);
  const liveSha = safeValue(deployment?.commit_short);

  const shaKnown = liveSha !== "unknown";
  const isProduction = environment === "production";
  const isMain = branch === "main";
  const isBrainSafe = checks?.exposes_brain_logic === false && checks?.exposes_runtime_secrets === false;

  const badgeIsGreen = shaKnown && isProduction && isMain && isBrainSafe;

  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={badgeIsGreen ? goodPillStyle : warnPillStyle}>
            {badgeIsGreen ? "Production Freshness Visible" : "Deployment Needs Attention"}
          </p>
          <h2 style={{ margin: "12px 0 8px" }}>Deployment Freshness</h2>
          <p style={{ margin: 0, color: "#4b5563" }}>
            Live production deployment metadata. The CLI compares this live SHA against local Git HEAD.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={codeStyle}>npm run hx2:deployment:status</span>
        </div>
      </div>

      <div style={{ marginTop: "16px", ...gridStyle }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
          <div style={isProduction ? goodPillStyle : warnPillStyle}>{environment}</div>
          <h3 style={{ margin: "12px 0 8px" }}>Environment</h3>
          <p style={{ color: "#4b5563" }}>Expected production for live domain checks.</p>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
          <div style={isMain ? goodPillStyle : warnPillStyle}>{branch}</div>
          <h3 style={{ margin: "12px 0 8px" }}>Branch</h3>
          <p style={{ color: "#4b5563" }}>Expected main for production deployment.</p>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
          <div style={shaKnown ? goodPillStyle : warnPillStyle}>Live SHA</div>
          <h3 style={{ margin: "12px 0 8px" }}>Production Commit</h3>
          <p><span style={codeStyle}>{liveSha}</span></p>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
          <div style={isBrainSafe ? goodPillStyle : warnPillStyle}>Metadata Only</div>
          <h3 style={{ margin: "12px 0 8px" }}>Safety</h3>
          <p style={{ color: "#4b5563" }}>
            Brain logic exposed: {String(checks?.exposes_brain_logic ?? "unknown")}
          </p>
          <p style={{ color: "#4b5563" }}>
            Secrets exposed: {String(checks?.exposes_runtime_secrets ?? "unknown")}
          </p>
        </div>
      </div>

      <p style={{ marginBottom: 0, color: "#6b7280", fontSize: "13px" }}>
        Generated: {deploymentStatus?.generated_at ?? "loading"} | Live URL: {safeValue(deployment?.vercel_url)}
      </p>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { OwnerQuickLinks } from "./_components/OwnerQuickLinks";
import { DeploymentFreshnessBadge } from "./_components/DeploymentFreshnessBadge";

type ReadinessValue = string | boolean;

type Surface = {
  id: string;
  label?: string;
  status?: string;
  endpoint?: string;
  command?: string;
  dry_run_command?: string;
  purpose?: string;
};

type NextCommand = {
  label: string;
  command: string;
};

type OwnerStatus = {
  ok: boolean;
  mode: string;
  route: string;
  generated_at: string;
  readiness: Record<string, ReadinessValue>;
  surfaces: Surface[];
  next_commands: NextCommand[];
  next_safe_step?: string;
};

type RetrievalCapability = {
  id: string;
  label?: string;
  route?: string;
  script?: string;
  status?: string;
  exposure?: string;
  notes?: string;
};

type RetrievalStatus = {
  ok: boolean;
  mode: string;
  route: string;
  ip_firewall: string;
  generated_at: string;
  capabilities: RetrievalCapability[];
  smoke_queries: string[];
  recommended_commands: string[];
  next_safe_step?: string;
};

type DeploymentStatus = {
  ok: boolean;
  mode: string;
  route: string;
  ip_firewall: string;
  generated_at: string;
  deployment: {
    provider: string;
    environment: string;
    branch: string;
    commit_sha: string;
    commit_short: string;
    commit_message: string;
    vercel_url: string;
    region: string;
  };
  checks: {
    can_compare_live_sha_to_local_head: boolean;
    exposes_brain_logic: boolean;
    exposes_runtime_secrets: boolean;
  };
  next_safe_step?: string;
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "32px",
  fontFamily: "Arial, Helvetica, sans-serif",
  background: "#f6f7f9",
  color: "#111827"
};

const shellStyle: CSSProperties = {
  maxWidth: "1120px",
  margin: "0 auto"
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
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px"
};

const pillStyle: CSSProperties = {
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
  ...pillStyle,
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

const buttonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid #111827",
  background: "#111827",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer"
};

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: "not-allowed"
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`${url} request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export default function OwnerStatusPage() {
  const [ownerStatus, setOwnerStatus] = useState<OwnerStatus | null>(null);
  const [retrievalStatus, setRetrievalStatus] = useState<RetrievalStatus | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [error, setError] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadStatus = useCallback(async () => {
    setIsRefreshing(true);
    setError("");

    try {
      const [ownerPayload, retrievalPayload, deploymentPayload] = await Promise.all([
        fetchJson<OwnerStatus>("/api/hx2/owner-status"),
        fetchJson<RetrievalStatus>("/api/hx2/retrieval-status"),
        fetchJson<DeploymentStatus>("/api/hx2/deployment-status")
      ]);

      setOwnerStatus(ownerPayload);
      setRetrievalStatus(retrievalPayload);
      setDeploymentStatus(deploymentPayload);
      setLastRefreshed(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown owner status error");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={pillStyle}>Owner Visibility Layer</p>
              <h1 style={{ margin: "12px 0 8px", fontSize: "34px" }}>HX2 Owner Status</h1>
              <p style={{ margin: 0, color: "#4b5563", fontSize: "16px" }}>
                Safe metadata-only dashboard for verify readiness, retrieval readiness, deployment visibility, retail-chat-verify-bundle, guarded_preflight_ready, npm run hx2:retail-chat:verify, and next commands.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={codeStyle}>/api/hx2/owner-status</div>
              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "13px" }}>
                IP firewall: safe metadata only
              </p>
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  style={isRefreshing ? disabledButtonStyle : buttonStyle}
                  onClick={loadStatus}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? "Refreshing..." : "Refresh status"}
                </button>
              </div>
              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "13px" }}>
                Last refreshed: {lastRefreshed || "loading"}
              </p>
            </div>
          </div>
        </section>

        <OwnerQuickLinks />

        <DeploymentFreshnessBadge deploymentStatus={deploymentStatus} />

        {error ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Status Error</h2>
            <p style={{ color: "#b91c1c" }}>{error}</p>
          </section>
        ) : null}

        {!ownerStatus && !retrievalStatus && !deploymentStatus && !error ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Loading owner status...</h2>
            <p style={{ color: "#6b7280" }}>Reading safe owner, retrieval, and deployment status metadata.</p>
          </section>
        ) : null}

        {deploymentStatus ? (
          <section style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <p style={pillStyle}>Deployment Visibility</p>
                <h2 style={{ margin: "12px 0 8px" }}>Deployment Status</h2>
                <p style={{ margin: 0, color: "#4b5563" }}>
                  Live safe deployment metadata for production freshness checks.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={codeStyle}>/api/hx2/deployment-status</div>
                <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "13px" }}>
                  {deploymentStatus.ip_firewall}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "16px", ...gridStyle }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                <div style={deploymentStatus.deployment.environment === "production" ? pillStyle : warnPillStyle}>
                  {deploymentStatus.deployment.environment}
                </div>
                <h3 style={{ margin: "12px 0 8px" }}>Environment</h3>
                <p><span style={codeStyle}>{deploymentStatus.deployment.provider}</span></p>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                <div style={pillStyle}>{deploymentStatus.deployment.branch}</div>
                <h3 style={{ margin: "12px 0 8px" }}>Branch</h3>
                <p><span style={codeStyle}>{deploymentStatus.deployment.commit_short}</span></p>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                <div style={deploymentStatus.checks.exposes_brain_logic ? warnPillStyle : pillStyle}>
                  brain safe
                </div>
                <h3 style={{ margin: "12px 0 8px" }}>Exposure Check</h3>
                <p style={{ color: "#4b5563" }}>
                  Brain logic exposed: {String(deploymentStatus.checks.exposes_brain_logic)}
                </p>
                <p style={{ color: "#4b5563" }}>
                  Secrets exposed: {String(deploymentStatus.checks.exposes_runtime_secrets)}
                </p>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                <div style={codeStyle}>{deploymentStatus.deployment.region}</div>
                <h3 style={{ margin: "12px 0 8px" }}>Vercel URL</h3>
                <p style={{ color: "#4b5563", overflowWrap: "anywhere" }}>
                  {deploymentStatus.deployment.vercel_url}
                </p>
              </div>
            </div>

            <p style={{ color: "#4b5563" }}>
              Commit message: {deploymentStatus.deployment.commit_message}
            </p>
            <p style={{ marginBottom: 0, color: "#6b7280", fontSize: "13px" }}>
              Deployment generated: {deploymentStatus.generated_at} | Mode: {deploymentStatus.mode}
            </p>
          </section>
        ) : null}

        {ownerStatus ? (
          <>
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Readiness</h2>
              <div style={gridStyle}>
                {Object.entries(ownerStatus.readiness).map(([key, value]) => (
                  <div key={key} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {key.replaceAll("_", " ")}
                    </div>
                    <div style={{ marginTop: "8px", fontWeight: 700 }}>{String(value)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Active Surfaces</h2>
              <div style={gridStyle}>
                {ownerStatus.surfaces.map((surface) => (
                  <article key={surface.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                    <div style={pillStyle}>{surface.status ?? "unknown"}</div>
                    <h3 style={{ margin: "12px 0 8px" }}>{surface.label ?? surface.id}</h3>
                    {surface.endpoint ? <p><span style={codeStyle}>{surface.endpoint}</span></p> : null}
                    {surface.command ? <p><span style={codeStyle}>{surface.command}</span></p> : null}
                    <p style={{ color: "#4b5563" }}>{surface.purpose}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {retrievalStatus ? (
          <section style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <p style={pillStyle}>Retrieval Health</p>
                <h2 style={{ margin: "12px 0 8px" }}>Retrieval Status</h2>
                <p style={{ margin: 0, color: "#4b5563" }}>
                  Live read-only retrieval metadata from the safe retrieval status endpoint.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={codeStyle}>/api/hx2/retrieval-status</div>
                <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "13px" }}>
                  {retrievalStatus.ip_firewall}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "16px", ...gridStyle }}>
              {retrievalStatus.capabilities.map((capability) => (
                <article key={capability.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                  <div style={capability.status === "active" ? pillStyle : warnPillStyle}>{capability.status ?? "unknown"}</div>
                  <h3 style={{ margin: "12px 0 8px" }}>{capability.label ?? capability.id}</h3>
                  {capability.route ? <p><span style={codeStyle}>{capability.route}</span></p> : null}
                  {capability.script ? <p><span style={codeStyle}>{capability.script}</span></p> : null}
                  <p style={{ color: "#4b5563" }}>{capability.notes}</p>
                </article>
              ))}
            </div>

            <div style={{ marginTop: "16px", ...gridStyle }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                <h3 style={{ marginTop: 0 }}>Smoke Queries</h3>
                {retrievalStatus.smoke_queries.map((query) => (
                  <p key={query}><span style={codeStyle}>{query}</span></p>
                ))}
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                <h3 style={{ marginTop: 0 }}>Retrieval Commands</h3>
                {retrievalStatus.recommended_commands.map((command) => (
                  <p key={command}><span style={codeStyle}>{command}</span></p>
                ))}
              </div>
            </div>

            <p style={{ marginBottom: 0, color: "#6b7280", fontSize: "13px" }}>
              Retrieval generated: {retrievalStatus.generated_at} | Mode: {retrievalStatus.mode}
            </p>
          </section>
        ) : null}

        {ownerStatus ? (
          <>
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Next Commands</h2>
              <div style={gridStyle}>
                {ownerStatus.next_commands.map((item) => (
                  <div key={item.command} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <p><span style={codeStyle}>{item.command}</span></p>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Next Safe Step</h2>
              <p style={{ marginBottom: 0, color: "#4b5563" }}>{ownerStatus.next_safe_step}</p>
              <p style={{ marginBottom: 0, color: "#6b7280", fontSize: "13px" }}>
                Owner generated: {ownerStatus.generated_at} | Mode: {ownerStatus.mode}
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}




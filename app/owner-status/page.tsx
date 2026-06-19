"use client";

import { useEffect, useState, type CSSProperties } from "react";

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

const codeStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "8px",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: "13px"
};

export default function OwnerStatusPage() {
  const [data, setData] = useState<OwnerStatus | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadOwnerStatus() {
      try {
        const response = await fetch("/api/hx2/owner-status", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Owner status request failed: ${response.status}`);
        }

        const payload = (await response.json()) as OwnerStatus;

        if (active) {
          setData(payload);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown owner status error");
        }
      }
    }

    loadOwnerStatus();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={pillStyle}>Owner Visibility Layer</p>
              <h1 style={{ margin: "12px 0 8px", fontSize: "34px" }}>HX2 Owner Status</h1>
              <p style={{ margin: 0, color: "#4b5563", fontSize: "16px" }}>
                Safe metadata-only dashboard for verify readiness, retrieval readiness, and next commands.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={codeStyle}>/api/hx2/owner-status</div>
              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "13px" }}>
                IP firewall: safe metadata only
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Status Error</h2>
            <p style={{ color: "#b91c1c" }}>{error}</p>
          </section>
        ) : null}

        {!data && !error ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Loading owner status...</h2>
            <p style={{ color: "#6b7280" }}>Reading safe owner status metadata.</p>
          </section>
        ) : null}

        {data ? (
          <>
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Readiness</h2>
              <div style={gridStyle}>
                {Object.entries(data.readiness).map(([key, value]) => (
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
                {data.surfaces.map((surface) => (
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

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Next Commands</h2>
              <div style={gridStyle}>
                {data.next_commands.map((item) => (
                  <div key={item.command} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <p><span style={codeStyle}>{item.command}</span></p>
                  </div>
                ))}
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Next Safe Step</h2>
              <p style={{ marginBottom: 0, color: "#4b5563" }}>{data.next_safe_step}</p>
              <p style={{ marginBottom: 0, color: "#6b7280", fontSize: "13px" }}>
                Generated: {data.generated_at} | Mode: {data.mode}
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

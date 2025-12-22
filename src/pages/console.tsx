import React, { useEffect, useState } from "react";


type StatusCardProps = {
  title: string;
  endpoint: string;
  description?: string;
};

type StatusState = {
  loading: boolean;
  ok: boolean;
  status: number | null;
  body: any;
  error?: string;
};

const cardContainerStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  padding: 16,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const badgeBaseStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: "2px 8px",
  fontSize: 11,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
};

const badgeOkStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  background: "#dcfce7",
  color: "#166534",
};

const badgeErrorStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  background: "#fee2e2",
  color: "#b91c1c",
};

const preStyle: React.CSSProperties = {
  fontSize: 11,
  background: "#f9fafb",
  borderRadius: 8,
  padding: 8,
  maxHeight: 200,
  overflowX: "auto",
  overflowY: "auto",
  whiteSpace: "pre",
};

function StatusCard({ title, endpoint, description }: StatusCardProps) {
  const [state, setState] = useState<StatusState>({
    loading: true,
    ok: false,
    status: null,
    body: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });

        let body: any = null;
        try {
          body = await res.json();
        } catch {
          body = null;
        }

        if (cancelled) return;

        setState({
          loading: false,
          ok: res.ok,
          status: res.status,
          body,
        });
      } catch (err: any) {
        if (cancelled) return;
        setState({
          loading: false,
          ok: false,
          status: null,
          body: null,
          error: err?.message || "Request failed",
        });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  const { loading, ok, status, body, error } = state;

  return (
    <div style={cardContainerStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          {description && (
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 2,
              }}
            >
              {description}
            </div>
          )}
        </div>
        <span style={ok ? badgeOkStyle : badgeErrorStyle}>
          {loading ? "Loading…" : ok ? "Online" : "Error"}
        </span>
      </div>

      <div style={{ fontSize: 11, color: "#6b7280" }}>
        Endpoint: <code>{endpoint}</code>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>
        HTTP {loading ? "…" : status ?? "—"}
      </div>

      {error && (
        <div style={{ fontSize: 11, color: "#b91c1c" }}>Error: {error}</div>
      )}

      {body && (
        <pre style={preStyle}>
          {JSON.stringify(body, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function ConsolePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#6b7280",
            }}
          >
            HX2 • Infra Console
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: 0,
            }}
          >
            HX2 Console (SAFE Mode)
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#4b5563",
              maxWidth: 640,
            }}
          >
            Live status for HX2 core, registry integrity, and AP2 worker.
            Cognitive modules stay sealed; this page only talks to safe{" "}
            <code>app/api/*</code>  endpoints.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <StatusCard
            title="HX2 Core"
            endpoint="/api/hx2_base"
            description="Base HX2 health and identity."
          />
          <StatusCard
            title="Registry Integrity"
            endpoint="/api/hx2/registry/integrity/deep"
            description="Registry checksum and node mapping."
          />
          <StatusCard
            title="AP2 Diagnostics"
            endpoint="/api/ap2/diagnostics"
            description="AP2 infra worker status and health checks."
          />
        </section>

        <section>
          <p
            style={{
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            CTAs like <code>hero-get-started</code> and <code>nav-console</code>{" "}
            can safely link to <code>/console</code>. No HX2 brain logic or
            prompts are exposed here.
          </p>
        </section>
      </div>
    </main>
  );
}

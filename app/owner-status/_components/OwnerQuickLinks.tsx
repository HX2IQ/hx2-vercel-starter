import type { CSSProperties } from "react";

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
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  color: "#3730a3",
  fontSize: "12px",
  fontWeight: 700
};

const linkButtonStyle: CSSProperties = {
  display: "inline-block",
  marginTop: "10px",
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1px solid #111827",
  background: "#111827",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 700
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

const quickLinks = [
  {
    label: "Owner API",
    href: "/api/hx2/owner-status",
    note: "Owner readiness, safe surfaces, and next commands."
  },
  {
    label: "Retrieval API",
    href: "/api/hx2/retrieval-status",
    note: "Retrieval health metadata and smoke-query references."
  },
  {
    label: "Deployment API",
    href: "/api/hx2/deployment-status",
    note: "Production deployment SHA, branch, environment, and freshness metadata."
  }
];

const commandLinks = [
  "npm run hx2:owner:status",
  "npm run hx2:owner:status:ui",
  "npm run hx2:deployment:status",
  "npm run hx2:retrieval:status",
  "npm run hx2:verify:status"
];

export function OwnerQuickLinks() {
  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={pillStyle}>Owner Quick Links</p>
          <h2 style={{ margin: "12px 0 8px" }}>Status Shortcuts</h2>
          <p style={{ margin: 0, color: "#4b5563" }}>
            Fast access to safe metadata endpoints and owner-side verification commands.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={codeStyle}>safe metadata only</span>
        </div>
      </div>

      <div style={{ marginTop: "16px", ...gridStyle }}>
        {quickLinks.map((link) => (
          <article key={link.href} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
            <h3 style={{ margin: "0 0 8px" }}>{link.label}</h3>
            <p style={{ color: "#4b5563" }}>{link.note}</p>
            <p><span style={codeStyle}>{link.href}</span></p>
            <a style={linkButtonStyle} href={link.href} target="_blank" rel="noreferrer">
              Open {link.label}
            </a>
          </article>
        ))}
      </div>

      <div style={{ marginTop: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px" }}>
        <h3 style={{ marginTop: 0 }}>Command Reference</h3>
        <div style={gridStyle}>
          {commandLinks.map((command) => (
            <p key={command} style={{ margin: 0 }}>
              <span style={codeStyle}>{command}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

export default function WaitlistPage() {
  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 0 }}>Request Access</h1>
      <p style={{ opacity: 0.85 }}>
        OptinodeIQ is in limited beta. Email us to request access and tell us which nodes you want.
      </p>
      <div style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Email</div>
        <a href="mailto:access@optinodeiq.com?subject=OptinodeIQ%20Access%20Request&body=Name%3A%0ACompany%3A%0AWhich%20nodes%3A%20(T2%2C%20SalesIQ%2C%20CRMIQ%2C%20etc)%0AWhat%20are%20you%20trying%20to%20do%3A%0A"
           style={{ textDecoration: "none", padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", display: "inline-block" }}>
          access@optinodeiq.com
        </a>
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          (We’ll replace this with an in-page form once the wiring is ready.)
        </div>
      </div>
    </div>
  );
}

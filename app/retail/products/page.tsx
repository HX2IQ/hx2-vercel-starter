export const dynamic = "force-dynamic";

const products = [
  { id: "t2", name: "TradeShowIQ (T2)", desc: "Scan booths → verified company + lead intelligence.", status: "Wiring in progress" },
  { id: "salesiq", name: "SalesIQ", desc: "Enterprise sales intelligence + coaching.", status: "Spec complete" },
  { id: "crmiq", name: "CRMIQ", desc: "Customer intelligence + retention + loyalty.", status: "Spec complete" },
];

export default function ProductsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 0 }}>Products</h1>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {products.map(p => (
          <div key={p.id} style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
            <div style={{ fontWeight: 900 }}>{p.name}</div>
            <div style={{ marginTop: 8, opacity: 0.8 }}>{p.desc}</div>
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>{p.status}</div>
            <div style={{ marginTop: 12 }}>
              <a href="/waitlist" style={{ textDecoration: "none", padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}>
                Request access
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

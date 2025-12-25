export default function Page() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>HX2 Console Chat (SAFE)</h1>
      <p style={{ opacity: 0.8 }}>SAFE-mode chat UI shell. Wire to a SAFE endpoint next.</p>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, height: 380, overflow: "auto", marginTop: 16 }}>
        <div style={{ opacity: 0.7 }}>No messages yet.</div>
      </div>

      <form style={{ display: "flex", gap: 8, marginTop: 12 }} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Type a command…"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}>
          Send
        </button>
      </form>
    </main>
  );
}

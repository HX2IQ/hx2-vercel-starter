export default function OIRoot() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "black",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Optimized Intelligence
      </h1>

      <p style={{
        maxWidth: "640px",
        textAlign: "center",
        opacity: 0.8,
        fontSize: "1.1rem",
        lineHeight: 1.6
      }}>
        A next-generation intelligence platform for health, markets, systems,
        and decision-making. Built on HX2.
      </p>

      <div style={{ marginTop: "2rem", opacity: 0.6 }}>
        <small>oi.optinodeiq.com · SAFE MODE</small>
      </div>
    </main>
  );
}

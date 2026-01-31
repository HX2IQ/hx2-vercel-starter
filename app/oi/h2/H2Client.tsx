"use client";

import { useEffect, useState } from "react";

export default function H2Client() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    fetch("/api/oi/h2/status", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setErr(String(e?.message || e)));
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>H2 (SAFE Shell)</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Node: <code>h2-oi</code> • Mode: <code>SAFE</code>
      </p>

      {err ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>Error: {err}</pre>
      ) : (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {data ? JSON.stringify(data, null, 2) : "Loading..."}
        </pre>
      )}
    </main>
  );
}

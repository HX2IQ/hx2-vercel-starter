"use client";

import { useEffect, useState } from "react";

type H2Result = {
  ok: boolean;
  result?: any;
  ts?: string;
};

export default function H2Page() {
  const [data, setData] = useState<H2Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/h2/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "SAFE",
        query: "status"
      })
    })
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>H2 — Situational Intelligence</h1>

      {loading && <p>Loading…</p>}

      {!loading && data?.ok && (
        <pre style={{ background: "#111", color: "#0f0", padding: 16 }}>
{JSON.stringify(data.result, null, 2)}
        </pre>
      )}

      {!loading && !data?.ok && (
        <p style={{ color: "red" }}>H2 error</p>
      )}
    </main>
  );
}

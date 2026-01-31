const ALLOW_ORIGINS = [
  "https://optinodeiq.com",
  "https://ap2-worker.optinodeiq.com"
];

function isAllowedUrl(u: string) {
  try {
    const url = new URL(u);
    const originOk = ALLOW_ORIGINS.includes(url.origin);
    // Optional extra safety: only allow calling our own API paths
    const pathOk =
      url.pathname.startsWith("/api/") &&
      !url.pathname.startsWith("/api/registry/"); // example blocklist
    return originOk && pathOk;
  } catch {
    return false;
  }
}

export async function run(task: any) {
  const mode = task?.payload?.mode ?? "SAFE";
  if (mode !== "SAFE") {
    return { ok: false, error: "Only SAFE mode allowed" };
  }

  const url = String(task?.payload?.url || "");
  const method = String(task?.payload?.method || "GET").toUpperCase();
  const headers = task?.payload?.headers || {};
  const body = task?.payload?.body ?? null;

  if (!isAllowedUrl(url)) {
    return { ok: false, error: "URL not allowed", url };
  }

  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { data = text; }

  return {
    ok: res.ok,
    httpStatus: res.status,
    data
  };
}